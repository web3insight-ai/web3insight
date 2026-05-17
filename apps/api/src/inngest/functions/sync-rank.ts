import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port of `sync:db:rank` — ecosystem ranking aggregation per-ecosystem in
 * separate steps so the longest-running ecosystems can retry without redoing
 * the whole batch.
 */
export const syncDbRank = inngest.createFunction(
  {
    id: 'sync-db-rank',
    name: 'Sync ecosystem rankings',
    retries: 2,
    triggers: [{ event: 'sync/db.rank' }, { cron: '0 6 * * *' }],
  },
  async ({ event, step }) => {
    // Narrow: cron triggers populate CronEventData (no ecoName); only sync/db.rank
    // event payloads carry the optional ecoName field.
    const data = event.data as { ecoName?: string } | undefined;
    const targetEco = data?.ecoName;

    if (targetEco) {
      await step.run(`rank-${targetEco}`, async () => {
        const c = getContainer(env);
        // RankService exposes per-eco ranking; the public API is the same as
        // ecoRankTotal/actorRank used in the legacy command body.
        await c.services.rank.ecoRankTotal(targetEco, false);
      });
      return { synced: targetEco };
    }

    const ecoNames = await step.run('list-ecosystems', async () => {
      const c = getContainer(env);
      return c.services.eco.getEcoNameFilters();
    });

    for (const eco of ecoNames) {
      await step.run(`rank-${eco}`, async () => {
        const c = getContainer(env);
        await c.services.rank.ecoRankTotal(eco, false);
      });
      await step.sleep('throttle', '2s'); // gentle on GitHub + DB
    }

    return { synced: ecoNames.length };
  },
);

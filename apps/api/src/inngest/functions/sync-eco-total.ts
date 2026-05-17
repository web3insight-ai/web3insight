import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port of `sync:eco:total` console command. Splits the original aggregate run
 * into recoverable steps so a Vercel function timeout mid-run resumes correctly.
 *
 * Steps mirror TotalService.test() body:
 *   1. listEcosystems
 *   2. indexerd (monthly stars + active devs)
 *   3. getActorDate / reposTotal / actorsTotalNew / ecoTotal / actorCountryStats
 */
export const syncEcoTotalFull = inngest.createFunction(
  {
    id: 'sync-eco-total-full',
    name: 'Sync ecosystem totals (full)',
    retries: 2,
    triggers: [{ event: 'sync/eco.total.full' }, { cron: '0 5 * * *' }],
  },
  async ({ step }) => {
    const ecoNames = await step.run('list-ecosystems', async () => {
      const c = getContainer(env);
      return c.services.eco.getEcoNameFilters();
    });

    await step.run('indexer-monthly', async () => {
      const c = getContainer(env);
      await c.services.total.indexerd();
    });

    await step.run('actor-date', async () => {
      const c = getContainer(env);
      await c.services.total.getActorDate(ecoNames);
    });

    await step.run('repos-total', async () => {
      const c = getContainer(env);
      await c.services.total.reposTotal(ecoNames);
    });

    await step.run('actors-total-new', async () => {
      const c = getContainer(env);
      await c.services.total.actorsTotalNew(ecoNames);
    });

    await step.run('eco-total', async () => {
      const c = getContainer(env);
      await c.services.total.ecoTotal();
    });

    await step.run('actor-country', async () => {
      const c = getContainer(env);
      await c.services.total.actorCountryStats(ecoNames);
    });

    return { ecosystems: ecoNames.length };
  },
);

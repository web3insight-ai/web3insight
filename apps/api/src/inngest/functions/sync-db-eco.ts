import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port stubs for sync:db:eco:upstream_repos, sync:db:eco:total, sync:db:eco:single.
 * These mostly invoke EcoService aggregations — wired to existing methods where
 * available.
 */
export const syncDbEcoUpstreamRepos = inngest.createFunction(
  {
    id: 'sync-db-eco-upstream-repos',
    name: 'Sync ecosystem upstream repos',
    retries: 2,
    triggers: [{ event: 'sync/db.eco.upstream-repos' }],
  },
  async ({ event, step }) => {
    const data = event.data as { ecoName?: string } | undefined;
    const ecoName = data?.ecoName ?? 'ALL';
    await step.run(`upstream-${ecoName}`, () => {
      void getContainer(env);
      return ecoName;
    });
    return {
      ecoName,
      note: 'sync-db-eco-upstream-repos pending Phase F service extraction',
    };
  },
);

export const syncDbEcoTotal = inngest.createFunction(
  {
    id: 'sync-db-eco-total',
    name: 'Sync ecosystem totals (DB)',
    retries: 1,
    triggers: [{ event: 'sync/db.eco.total' }],
  },
  async ({ step }) => {
    await step.run('eco-total', async () => {
      await getContainer(env).services.total.ecoTotal();
    });
    return { ok: true };
  },
);

export const syncDbEcoSingle = inngest.createFunction(
  {
    id: 'sync-db-eco-single',
    name: 'Sync single ecosystem',
    retries: 2,
    triggers: [{ event: 'sync/db.eco.single' }],
  },
  async ({ event, step }) => {
    const data = event.data as { ecoName?: string } | undefined;
    const ecoName = data?.ecoName;
    if (!ecoName) return { ok: false, error: 'ecoName required' };
    await step.run(`single-${ecoName}`, () => {
      void getContainer(env);
      return ecoName;
    });
    return { ok: true, ecoName };
  },
);

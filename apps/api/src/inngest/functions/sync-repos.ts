import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port of `sync:repos` (full) and `sync:repos:single` (per-repo) console
 * commands. Splits ecosystem traversal into per-ecosystem steps so each is
 * checkpointable / retryable independently.
 *
 * TODO(phase-f): wire ReposService.syncByEcosystem / syncSingle once the
 * specific method signatures are reviewed; for now these dispatch a no-op
 * step so the function registers with Inngest cloud.
 */
export const syncReposFull = inngest.createFunction(
  {
    id: 'sync-repos-full',
    name: 'Sync repositories (full)',
    retries: 2,
    triggers: [{ event: 'sync/repos.full' }],
  },
  async ({ step }) => {
    const ecoNames = await step.run('list-ecosystems', async () => {
      return getContainer(env).services.eco.getEcoNameFilters();
    });
    // TODO(phase-f): per-eco repo sync once the service exposes a public method
    return {
      ecosystems: ecoNames.length,
      note: 'sync-repos-full pending Phase F repo sync extraction',
    };
  },
);

export const syncReposSingle = inngest.createFunction(
  {
    id: 'sync-repos-single',
    name: 'Sync single repository',
    retries: 3,
    triggers: [{ event: 'sync/repos.single' }],
  },
  async ({ event, step }) => {
    const data = event.data as { repoId?: number } | undefined;
    const repoId = data?.repoId;
    if (!repoId) {
      return { ok: false, error: 'repoId required' };
    }
    await step.run('fetch-repo-info', () => {
      const c = getContainer(env);
      void c; // TODO(phase-f): wire ReposService.fetchByIdAndUpdate(repoId)
      return repoId;
    });
    return { ok: true, repoId };
  },
);

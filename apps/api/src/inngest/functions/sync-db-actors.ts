import { inngest } from '../client';
import { getContainer } from '@/app/container';
import { env } from '@/config/env';

/**
 * Port stubs for sync:db:actors:api (live API enrichment) and
 * sync:db:actors:archive (annual archive backfill). Both originally streamed
 * hundreds of thousands of actor records — Phase F's step.run() batching
 * makes them resumable per chunk.
 *
 * TODO(phase-f): implement chunked actor enrichment via UsersService once a
 * batch-iter method is exposed.
 */
export const syncDbActorsApi = inngest.createFunction(
  {
    id: 'sync-db-actors-api',
    name: 'Sync actor metadata (API)',
    retries: 2,
    triggers: [{ event: 'sync/db.actors.api' }],
  },
  async ({ event, step }) => {
    const data = event.data as
      | { startActorId?: number; batchSize?: number }
      | undefined;
    const batchSize = data?.batchSize ?? 500;
    await step.run('init-batch', () => {
      void getContainer(env);
      return { batchSize, startActorId: data?.startActorId ?? 0 };
    });
    return {
      ok: true,
      note: 'sync-db-actors-api pending Phase F batch extraction',
    };
  },
);

export const syncDbActorsArchive = inngest.createFunction(
  {
    id: 'sync-db-actors-archive',
    name: 'Backfill actor archive',
    retries: 2,
    triggers: [{ event: 'sync/db.actors.archive' }],
  },
  async ({ event, step }) => {
    const data = event.data as { year?: number } | undefined;
    const year = data?.year ?? new Date().getFullYear() - 1;
    await step.run('archive-year', () => {
      void getContainer(env);
      return year;
    });
    return {
      ok: true,
      year,
      note: 'sync-db-actors-archive pending Phase F archive extraction',
    };
  },
);

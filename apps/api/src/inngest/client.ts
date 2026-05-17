import { Inngest } from 'inngest';

/**
 * Inngest client — durable background jobs for the 11 long-running sync tasks
 * that used to live as nestjs-console commands. Each function uses step.run()
 * to checkpoint progress so Vercel function timeouts don't lose work.
 *
 * Local dev: `npx inngest-cli dev` alongside `vercel dev`.
 */
export const inngest = new Inngest({
  id: 'web3insight-api',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type Events = {
  'sync/repos.full': { data: Record<string, never> };
  'sync/repos.single': { data: { repoId: number } };
  'sync/db.actors.api': { data: { startActorId?: number; batchSize?: number } };
  'sync/db.actors.archive': { data: { year: number } };
  'sync/db.eco.upstream-repos': { data: { ecoName: string } };
  'sync/db.eco.total': { data: Record<string, never> };
  'sync/db.eco.single': { data: { ecoName: string } };
  'sync/db.rank': { data: { ecoName?: string } };
  'sync/eco.total.full': { data: Record<string, never> };
  'sync/years': { data: { year: number } };
};

export { syncEcoTotalFull } from './sync-eco-total';
export { syncDbRank } from './sync-rank';
export { syncYears } from './sync-years';
export { syncReposFull, syncReposSingle } from './sync-repos';
export { syncDbActorsApi, syncDbActorsArchive } from './sync-db-actors';
export {
  syncDbEcoUpstreamRepos,
  syncDbEcoTotal,
  syncDbEcoSingle,
} from './sync-db-eco';

/**
 * ⚠️ DEFERRED — Inngest is being dropped from the stack (decision 2026-05-17).
 *
 * These 9 functions are KEPT IN TREE as the canonical scaffold of the 11
 * long-running console-command ports, but they will NOT be registered with
 * Inngest cloud or relied upon in production. The replacement story is
 * "Vercel Cron + Postgres checkpoint table" — to be implemented in a
 * follow-up commit.
 *
 * Until then:
 *   • api/inngest/[...slug].ts still mounts the webhook (no-op without
 *     INNGEST_SIGNING_KEY / INNGEST_EVENT_KEY in Vercel env).
 *   • vercel.json keeps the route definition; safe to leave because
 *     the handler short-circuits when env vars are absent.
 *   • Do NOT add new Inngest functions here. Add cron handlers under
 *     apps/api/api/cron/ with a checkpoint row in sync_checkpoints.
 *
 * Trigger/step skeletons preserved below so the replacement crons can
 * reuse the chunking boundaries already designed:
 *   sync-eco-total-full       · per-country chunks
 *   sync-db-rank              · per-ecosystem chunks
 *   sync-years                · per-year chunks
 *   sync-db-eco-total         · single-shot
 *   sync-repos-full           · per-ecosystem chunks
 *   sync-repos-single         · single repo by id
 *   sync-db-actors-api        · cursor-paginated batches (batchSize=500)
 *   sync-db-actors-archive    · per-year chunks
 *   sync-db-eco-upstream-repos · per-ecosystem chunks
 *   sync-db-eco-single        · single ecosystem by name
 */

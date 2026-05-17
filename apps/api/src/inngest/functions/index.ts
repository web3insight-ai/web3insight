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
 * Inngest function registry — full Phase F coverage of the 11 long-running
 * legacy console commands. Functions marked TODO carry the trigger wiring +
 * step boundary; the underlying ReposService / UsersService batch methods
 * land in a follow-up commit once the legacy commands are deleted.
 *
 * ✅ Live functions (cron + event triggers):
 *   sync-eco-total-full     · sync/eco.total.full   · cron 0 5 * * *
 *   sync-db-rank            · sync/db.rank          · cron 0 6 * * *
 *   sync-years              · sync/years            · cron 0 7 1 * *
 *   sync-db-eco-total       · sync/db.eco.total
 *
 * 🚧 Scaffolded (event triggers + step skeleton; service method TODO):
 *   sync-repos-full         · sync/repos.full
 *   sync-repos-single       · sync/repos.single
 *   sync-db-actors-api      · sync/db.actors.api
 *   sync-db-actors-archive  · sync/db.actors.archive
 *   sync-db-eco-upstream-repos · sync/db.eco.upstream-repos
 *   sync-db-eco-single      · sync/db.eco.single
 */

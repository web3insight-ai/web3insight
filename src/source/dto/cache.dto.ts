export const CacheKey = {
  ReposTotal: 'repos_total',
  ActorTotal: 'actor_total',
  ActorWeekTotal: 'actor_week_total',
  ActorMonthTotal: 'actor_month_total',
  ActorCoreTotal: 'actor_core_total',
  EcoTotal: 'eco_total',
  EcoRank: 'eco_rank',
  RepoStarRank: 'repo_star_rank',
  ActorCommitRank: 'actor_commit_rank',
} as const;

export type CacheKeyType = typeof CacheKey;

export type CacheKeyName = keyof typeof CacheKey;

export type CacheKeyValue = (typeof CacheKey)[keyof typeof CacheKey];

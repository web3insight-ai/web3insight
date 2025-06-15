export const CacheKey = {
  RepoTotal: 'repo_total',
  ActorTotal: 'actor_total',
  ActorTotalNew: 'actor_total_new',
  ActorWeekTotal: 'actor_week_total',
  ActorMonthTotal: 'actor_month_total',
  ActorCoreTotal: 'actor_core_total',
  EcoTotal: 'eco_repo_total',
  EcoRank: 'eco_rank',
  RepoStarRank: 'repo_star_rank',
  ActorScoreRank: 'actor_score_rank',
} as const;

export type CacheKeyType = typeof CacheKey;

export type CacheKeyName = keyof typeof CacheKey;

export type CacheKeyValue = (typeof CacheKey)[keyof typeof CacheKey];

export const CacheKey = {
  ReposTotal: 'repos_total',
  ActorTotal: 'actor_total',
  ActorCoreTotal: 'actor_core_total',
  EcoTotal: 'eco_total',
  EcoRank: 'eco_rank',
} as const;

export type CacheKeyType = typeof CacheKey;

export type CacheKeyName = keyof typeof CacheKey;

export type CacheKeyValue = (typeof CacheKey)[keyof typeof CacheKey];

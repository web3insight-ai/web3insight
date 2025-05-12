export const CacheKey = {
  ReposTotal: 'repos_total',
  ActorTotal: 'actor_total',
  EcoTotal: 'eco_total',
} as const;

export type CacheKeyType = typeof CacheKey;

export type CacheKeyName = keyof typeof CacheKey;

export type CacheKeyValue = (typeof CacheKey)[keyof typeof CacheKey];

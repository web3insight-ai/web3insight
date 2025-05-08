export const CacheKey = {
  ReposNum: 'repos_num',
  ActorNum: 'actor_num',
} as const;

export type CacheKeyType = typeof CacheKey;

export type CacheKeyName = keyof typeof CacheKey;

export type CacheKeyValue = (typeof CacheKey)[keyof typeof CacheKey];

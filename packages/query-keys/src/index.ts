/**
 * Shared TanStack Query key factory + sensible defaults.
 *
 * For oRPC procedures, prefer using `orpc.<router>.<proc>.queryOptions(...)` from
 * `@web3insight/orpc-client` — those generate keys automatically. Use this module
 * only for non-RPC keys (e.g., local-only state, third-party API calls).
 */

export const queryKeys = {
  all: ['web3insight'] as const,

  // Domain segments — extend per-app as needed
  developers: () => [...queryKeys.all, 'developers'] as const,
  developer: (id: string | number) => [...queryKeys.developers(), id] as const,

  repositories: () => [...queryKeys.all, 'repositories'] as const,
  repository: (id: string | number) => [...queryKeys.repositories(), id] as const,

  ecosystems: () => [...queryKeys.all, 'ecosystems'] as const,
  ecosystem: (name: string) => [...queryKeys.ecosystems(), name] as const,

  // Auth / current user
  me: () => [...queryKeys.all, 'me'] as const,
} as const;

export type QueryKeys = typeof queryKeys;

/** Default cache configuration for read-heavy stats endpoints. */
export const STATS_CACHE_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 min
  gcTime: 30 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

/** Default cache configuration for user-specific data. */
export const USER_CACHE_OPTIONS = {
  staleTime: 60 * 1000,
  refetchOnWindowFocus: true,
} as const;

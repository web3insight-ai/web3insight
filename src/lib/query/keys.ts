/**
 * Query Key Factory
 *
 * Provides a structured way to create query keys for TanStack Query.
 * This enables:
 * - Type-safe query keys
 * - Easy cache invalidation
 * - Consistent key structure across the app
 *
 * @example
 * // Basic usage
 * useQuery({ queryKey: queryKeys.ecosystems.list() })
 *
 * // With params
 * useQuery({ queryKey: queryKeys.developers.total({ eco: 'ethereum' }) })
 *
 * // Invalidation
 * queryClient.invalidateQueries({ queryKey: queryKeys.developers.all })
 */

export const queryKeys = {
  // --------------------------------------------------------------------------
  // Ecosystems
  // --------------------------------------------------------------------------
  ecosystems: {
    all: ["ecosystems"] as const,
    total: () => [...queryKeys.ecosystems.all, "total"] as const,
    list: () => [...queryKeys.ecosystems.all, "list"] as const,
    detail: (name: string) =>
      [...queryKeys.ecosystems.all, "detail", name] as const,
    statistics: (name: string) =>
      [...queryKeys.ecosystems.all, "statistics", name] as const,
    // Admin
    adminList: () => [...queryKeys.ecosystems.all, "admin", "list"] as const,
    adminRepoList: (params?: { eco?: string }) =>
      [...queryKeys.ecosystems.all, "admin", "repos", params] as const,
  },

  // --------------------------------------------------------------------------
  // Developers (Actors)
  // --------------------------------------------------------------------------
  developers: {
    all: ["developers"] as const,
    total: (params?: { eco?: string; scope?: "ALL" | "Core" }) =>
      [...queryKeys.developers.all, "total", params] as const,
    growthCount: (params?: { eco?: string }) =>
      [...queryKeys.developers.all, "growth", params] as const,
    list: (params?: { eco?: string }) =>
      [...queryKeys.developers.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.developers.all, "detail", id] as const,
    trendList: (params?: { eco?: string; period?: "week" | "month" }) =>
      [...queryKeys.developers.all, "trend", params] as const,
    countryRank: (params?: { eco?: string }) =>
      [...queryKeys.developers.all, "countryRank", params] as const,
  },

  // --------------------------------------------------------------------------
  // Repositories
  // --------------------------------------------------------------------------
  repositories: {
    all: ["repositories"] as const,
    total: (params?: { eco?: string }) =>
      [...queryKeys.repositories.all, "total", params] as const,
    list: (params?: { eco?: string }) =>
      [...queryKeys.repositories.all, "list", params] as const,
    detail: (id: string | number) =>
      [...queryKeys.repositories.all, "detail", id] as const,
    trending: (params?: { eco?: string }) =>
      [...queryKeys.repositories.all, "trending", params] as const,
    developerActivity: (params?: { eco?: string }) =>
      [...queryKeys.repositories.all, "developerActivity", params] as const,
    activeDevelopers: (repoId: number) =>
      [...queryKeys.repositories.all, "activeDevelopers", repoId] as const,
  },

  // --------------------------------------------------------------------------
  // Statistics (Overview)
  // --------------------------------------------------------------------------
  statistics: {
    all: ["statistics"] as const,
    overview: () => [...queryKeys.statistics.all, "overview"] as const,
  },

  // --------------------------------------------------------------------------
  // Custom Analysis
  // --------------------------------------------------------------------------
  custom: {
    all: ["custom"] as const,
    analysisUserList: (params?: Record<string, unknown>) =>
      [...queryKeys.custom.all, "analysisUsers", params] as const,
    analysisUser: (id: number) =>
      [...queryKeys.custom.all, "analysisUser", id] as const,
  },

  // --------------------------------------------------------------------------
  // x402 Donate
  // --------------------------------------------------------------------------
  donate: {
    all: ["donate"] as const,
    list: () => [...queryKeys.donate.all, "list"] as const,
    detail: (id: number) => [...queryKeys.donate.all, "detail", id] as const,
    detailByName: (name: string) =>
      [...queryKeys.donate.all, "detailByName", name] as const,
  },
};

// Type helper for query keys
export type QueryKeys = typeof queryKeys;

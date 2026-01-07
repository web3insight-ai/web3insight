/**
 * Server-side prefetch functions for TanStack Query
 *
 * These functions use the api client directly (which has access to server env vars).
 * They must use the same queryKey as the client-side hooks for proper hydration.
 *
 * Usage in server components:
 * ```tsx
 * const queryClient = getQueryClient();
 * await prefetchDevelopers(queryClient);
 * return (
 *   <HydrationBoundary state={dehydrate(queryClient)}>
 *     <ClientComponent />
 *   </HydrationBoundary>
 * );
 * ```
 */

import type { QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "./keys";

/**
 * Prefetch developer list for SSR
 */
export async function prefetchDevelopers(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.developers.list(),
    queryFn: async () => {
      const result = await api.actors.getRankList();
      return result.success ? result.data.list : [];
    },
  });
}

/**
 * Prefetch repository list for SSR
 */
export async function prefetchRepositories(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.repositories.list(),
    queryFn: async () => {
      const result = await api.repos.getRankList();
      return result.success ? result.data.list : [];
    },
  });
}

/**
 * Prefetch ecosystem list for SSR
 */
export async function prefetchEcosystems(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.ecosystems.list(),
    queryFn: async () => {
      const result = await api.ecosystems.getRankList();
      return result.success ? result.data.list : [];
    },
  });
}

/**
 * Prefetch overview statistics for SSR
 * Returns the same shape as OverviewStatistics from useStatistics hook
 */
export async function prefetchStatistics(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.statistics.overview(),
    queryFn: async () => {
      const result = await api.statistics.getOverview();
      if (result.success) {
        return {
          totalEcosystems: Number(result.data.ecosystem) || 0,
          totalRepositories: Number(result.data.repository) || 0,
          totalDevelopers: Number(result.data.developer) || 0,
          totalCoreDevelopers: Number(result.data.coreDeveloper) || 0,
        };
      }
      return {
        totalEcosystems: 0,
        totalRepositories: 0,
        totalDevelopers: 0,
        totalCoreDevelopers: 0,
      };
    },
  });
}

/**
 * Prefetch donate repo list for SSR
 * Reason: Server prefetch to enable instant page loads with hydration
 */
export async function prefetchDonateRepos(queryClient: QueryClient) {
  try {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.donate.list(),
      queryFn: async () => {
        const result = await api.donate.list();
        if (!result.success) {
          // Reason: Throw error so TanStack Query knows the fetch failed
          // This prevents hydrating with empty data on error
          console.error(
            "[SSR] Failed to prefetch donate repos:",
            result.message,
          );
          throw new Error(result.message || "Failed to fetch donate repos");
        }
        return result.data ?? [];
      },
      // Reason: Short stale time to ensure client refetches fresh data
      staleTime: 30 * 1000,
    });
  } catch (error) {
    // Reason: Log but don't throw - let client-side fetch handle the data
    console.error("[SSR] Error prefetching donate repos:", error);
  }
}

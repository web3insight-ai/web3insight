import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

// ============================================================================
// Types
// ============================================================================

export interface OverviewStatistics {
  totalEcosystems: number;
  totalDevelopers: number;
  totalCoreDevelopers: number;
  totalRepositories: number;
}

interface StatisticsApiResponse {
  success: boolean;
  data: {
    ecosystem: number;
    repository: number;
    developer: number;
    coreDeveloper: number;
  };
  message?: string;
}

// ============================================================================
// Query Options Factory
// ============================================================================

export const statisticsQueryOptions = {
  /**
   * Get overview statistics (combined data for homepage)
   * Calls the Next.js API route which proxies to the backend
   */
  overview: () =>
    queryOptions({
      queryKey: queryKeys.statistics.overview(),
      queryFn: async (): Promise<OverviewStatistics> => {
        const response = await fetch("/api/statistics/overview");
        const json: StatisticsApiResponse = await response.json();

        if (!json.success) {
          console.warn("Statistics API error:", json.message);
        }

        return {
          totalEcosystems: Number(json.data?.ecosystem ?? 0),
          totalDevelopers: Number(json.data?.developer ?? 0),
          totalCoreDevelopers: Number(json.data?.coreDeveloper ?? 0),
          totalRepositories: Number(json.data?.repository ?? 0),
        };
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

// ============================================================================
// Client-Side Hooks
// ============================================================================

/**
 * Hook to get overview statistics
 */
export function useOverviewStatistics() {
  return useQuery(statisticsQueryOptions.overview());
}

// ============================================================================
// Suspense-Enabled Hooks
// ============================================================================

export function useSuspenseOverviewStatistics() {
  return useSuspenseQuery(statisticsQueryOptions.overview());
}

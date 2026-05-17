import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { RepoRankRecord, ListResponse } from "@/lib/api/types";

// ============================================================================
// Types
// ============================================================================

interface RepositoriesApiResponse {
  success: boolean;
  data: ListResponse<RepoRankRecord>;
  message?: string;
}

// ============================================================================
// Query Options Factory
// ============================================================================

export const repositoryQueryOptions = {
  /**
   * Get repository rank list
   * Calls the Next.js API route which proxies to the backend
   */
  list: () =>
    queryOptions({
      queryKey: queryKeys.repositories.list(),
      queryFn: async (): Promise<RepoRankRecord[]> => {
        const response = await fetch("/api/repositories");
        const json: RepositoriesApiResponse = await response.json();

        if (!json.success) {
          console.warn("Repositories API error:", json.message);
        }

        return json.data?.list ?? [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
};

// ============================================================================
// Client-Side Hooks
// ============================================================================

/**
 * Hook to get repository rank list
 */
export function useRepositoryList() {
  return useQuery(repositoryQueryOptions.list());
}

// ============================================================================
// Suspense-Enabled Hooks
// ============================================================================

export function useSuspenseRepositoryList() {
  return useSuspenseQuery(repositoryQueryOptions.list());
}

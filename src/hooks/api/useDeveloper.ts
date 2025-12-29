import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { ActorRankRecord, ListResponse } from "@/lib/api/types";

// ============================================================================
// Types
// ============================================================================

interface DevelopersApiResponse {
  success: boolean;
  data: ListResponse<ActorRankRecord>;
  message?: string;
}

// ============================================================================
// Query Options Factory
// Used for both client hooks and server-side prefetching
// ============================================================================

export const developerQueryOptions = {
  /**
   * Get developer rank list
   * Calls the Next.js API route which proxies to the backend
   */
  list: () =>
    queryOptions({
      queryKey: queryKeys.developers.list(),
      queryFn: async (): Promise<ActorRankRecord[]> => {
        const response = await fetch("/api/developers");
        const json: DevelopersApiResponse = await response.json();

        if (!json.success) {
          console.warn("Developers API error:", json.message);
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
 * Hook to get developer rank list
 */
export function useDeveloperList() {
  return useQuery(developerQueryOptions.list());
}

// ============================================================================
// Suspense-Enabled Hooks (for use with React Suspense)
// ============================================================================

export function useSuspenseDeveloperList() {
  return useSuspenseQuery(developerQueryOptions.list());
}

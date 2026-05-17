import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { EcoRankRecord, ListResponse } from "@/lib/api/types";

// ============================================================================
// Types
// ============================================================================

interface EcosystemsApiResponse {
  success: boolean;
  data: ListResponse<EcoRankRecord>;
  message?: string;
}

// ============================================================================
// Query Options Factory
// ============================================================================

export const ecosystemQueryOptions = {
  /**
   * Get ecosystem rank list
   * Calls the Next.js API route which proxies to the backend
   */
  list: () =>
    queryOptions({
      queryKey: queryKeys.ecosystems.list(),
      queryFn: async (): Promise<EcoRankRecord[]> => {
        const response = await fetch("/api/ecosystems");
        const json: EcosystemsApiResponse = await response.json();

        if (!json.success) {
          console.warn("Ecosystems API error:", json.message);
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
 * Hook to get ecosystem rank list
 */
export function useEcosystemList() {
  return useQuery(ecosystemQueryOptions.list());
}

// ============================================================================
// Suspense-Enabled Hooks
// ============================================================================

export function useSuspenseEcosystemList() {
  return useSuspenseQuery(ecosystemQueryOptions.list());
}

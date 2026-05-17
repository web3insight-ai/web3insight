import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { DonateRepo, ResponseResult } from "@/lib/api/types";

// ============================================================================
// Types
// ============================================================================

interface DonateReposApiResponse {
  success: boolean;
  data: DonateRepo[];
  message?: string;
}

interface DonateRepoApiResponse {
  success: boolean;
  data: DonateRepo;
  message?: string;
}

interface SubmitDonateRepoParams {
  repo_full_name: string;
}

interface CheckDonateRepoParams {
  repo_full_name: string;
}

// ============================================================================
// Query Options Factory
// ============================================================================

export const donateQueryOptions = {
  /**
   * Get list of all donate repos
   */
  list: () =>
    queryOptions({
      queryKey: queryKeys.donate.list(),
      queryFn: async (): Promise<DonateRepo[]> => {
        const response = await fetch("/api/donate/repos", {
          // Reason: Prevent browser caching issues
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const json: DonateReposApiResponse = await response.json();

        // Reason: Throw error on API failure so TanStack Query can handle retry
        if (!json.success) {
          throw new Error(json.message || "Failed to fetch donate repos");
        }

        return json.data ?? [];
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      // Reason: Always refetch when mounting after navigation to ensure fresh data
      refetchOnMount: "always",
      // Reason: Retry failed requests up to 3 times
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    }),

  /**
   * Get donate repo by ID
   */
  byId: (id: number | string) =>
    queryOptions({
      queryKey: queryKeys.donate.detail(String(id)),
      queryFn: async (): Promise<DonateRepo | null> => {
        const response = await fetch(`/api/donate/repos/${id}`);
        const json: DonateRepoApiResponse = await response.json();

        if (!json.success) {
          return null;
        }

        return json.data ?? null;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      enabled: !!id,
    }),
};

// ============================================================================
// Prefetch Functions
// ============================================================================

export async function prefetchDonateRepoList(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await queryClient.prefetchQuery(donateQueryOptions.list());
}

// ============================================================================
// Client-Side Hooks
// ============================================================================

/**
 * Hook to get donate repo list
 */
export function useDonateRepoList() {
  return useQuery(donateQueryOptions.list());
}

/**
 * Hook to get donate repo by ID
 */
export function useDonateRepoById(id: number | string) {
  return useQuery(donateQueryOptions.byId(id));
}

// ============================================================================
// Suspense-Enabled Hooks
// ============================================================================

export function useSuspenseDonateRepoList() {
  return useSuspenseQuery(donateQueryOptions.list());
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook to check a repository without writing to database
 * Use this in Step 1 to verify repo exists and check for donation.json
 */
export function useCheckDonateRepo() {
  return useMutation({
    mutationFn: async (
      params: CheckDonateRepoParams,
    ): Promise<ResponseResult<DonateRepo>> => {
      const response = await fetch("/api/donate/repos/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const json = await response.json();
      return json;
    },
  });
}

/**
 * Hook to submit a repository for donation (writes to database)
 * Only call this after verifying donation.json exists
 */
export function useSubmitDonateRepo() {
  return useMutation({
    mutationFn: async (
      params: SubmitDonateRepoParams,
    ): Promise<ResponseResult<DonateRepo>> => {
      const response = await fetch("/api/donate/repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const json = await response.json();
      return json;
    },
  });
}

/**
 * Hook to refetch donate list after registration
 */
export function useInvalidateDonateList() {
  const queryClient = useQueryClient();

  return async (optimisticRepo?: DonateRepo) => {
    // Get current cache data first
    const currentData = queryClient.getQueryData<DonateRepo[]>(
      queryKeys.donate.list(),
    );

    // Optimistic update: add new repo to existing list immediately
    if (optimisticRepo) {
      const existingData = currentData ?? [];
      const existingIndex = existingData.findIndex(
        (repo) => repo.repo_id === optimisticRepo.repo_id,
      );

      if (existingIndex >= 0) {
        const next = [...existingData];
        next[existingIndex] = optimisticRepo;
        queryClient.setQueryData(queryKeys.donate.list(), next);
      } else {
        queryClient.setQueryData(queryKeys.donate.list(), [
          optimisticRepo,
          ...existingData,
        ]);
      }
    }

    // Reason: Invalidate and refetch immediately to ensure cache consistency
    // The database transaction should be committed by the time API response returns
    await queryClient.invalidateQueries({
      queryKey: queryKeys.donate.list(),
      refetchType: "active",
    });
  };
}

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
        const response = await fetch("/api/donate/repos");
        const json: DonateReposApiResponse = await response.json();

        if (!json.success) {
          console.warn("Donate repos API error:", json.message);
        }

        return json.data ?? [];
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      // Keep previous data visible while refetching
      placeholderData: (previousData) => previousData,
    }),

  /**
   * Get donate repo by name
   */
  byName: (name: string) =>
    queryOptions({
      queryKey: queryKeys.donate.detailByName(name),
      queryFn: async (): Promise<DonateRepo | null> => {
        const encodedName = encodeURIComponent(name);
        const response = await fetch(`/api/donate/repos/name/${encodedName}`);
        const json: DonateRepoApiResponse = await response.json();

        if (!json.success) {
          return null;
        }

        return json.data ?? null;
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
      enabled: !!name,
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
 * Hook to get donate repo by name
 */
export function useDonateRepoByName(name: string) {
  return useQuery(donateQueryOptions.byName(name));
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

    // Optimistic update: add new repo to existing list
    if (optimisticRepo && currentData) {
      const existingIndex = currentData.findIndex(
        (repo) => repo.repo_id === optimisticRepo.repo_id,
      );

      if (existingIndex >= 0) {
        const next = [...currentData];
        next[existingIndex] = optimisticRepo;
        queryClient.setQueryData(queryKeys.donate.list(), next);
      } else {
        queryClient.setQueryData(queryKeys.donate.list(), [
          optimisticRepo,
          ...currentData,
        ]);
      }
    }

    // Small delay to ensure database transaction is committed
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Invalidate and refetch to get the full list from server
    await queryClient.invalidateQueries({
      queryKey: queryKeys.donate.list(),
    });
  };
}

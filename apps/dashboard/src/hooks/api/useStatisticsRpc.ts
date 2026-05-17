"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { STATS_CACHE_OPTIONS } from "@web3insight/query-keys";
import type { OverviewStatistics } from "./useStatistics";

/**
 * oRPC-backed equivalent of useOverviewStatistics. Composes 4 parallel `total.*`
 * procedures and maps them to the same `OverviewStatistics` shape consumed by
 * the dashboard homepage cards. Eventually replaces useStatistics once all
 * callers migrate.
 */
export function useOverviewStatisticsRpc(ecoName = "all") {
  const queries = useQueries({
    queries: [
      {
        ...orpc.total.ecosystems.queryOptions({ input: {} }),
        ...STATS_CACHE_OPTIONS,
      },
      {
        ...orpc.total.actors.queryOptions({
          input: { eco_name: ecoName, scope: "all" },
        }),
        ...STATS_CACHE_OPTIONS,
      },
      {
        ...orpc.total.actors.queryOptions({
          input: { eco_name: ecoName, scope: "core" },
        }),
        ...STATS_CACHE_OPTIONS,
      },
      {
        ...orpc.total.repos.queryOptions({ input: { eco_name: ecoName } }),
        ...STATS_CACHE_OPTIONS,
      },
    ],
  });

  const [eco, actors, coreActors, repos] = queries;
  const data: OverviewStatistics | undefined =
    eco.data || actors.data || coreActors.data || repos.data
      ? {
        totalEcosystems: Number(eco.data?.total ?? 0),
        totalDevelopers: Number(actors.data?.total ?? 0),
        totalCoreDevelopers: Number(coreActors.data?.total ?? 0),
        totalRepositories: Number(repos.data?.total ?? 0),
      }
      : undefined;

  return {
    data,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    errors: queries.map((q) => q.error).filter(Boolean),
  };
}

/**
 * Ranking lists from rank.* RPC. Replaces direct REST fetches in
 * EcosystemRankWidget / RepoRankWidget / ActorRankWidget once those migrate.
 */
export function useEcosystemsTopRpc() {
  return useQuery({
    ...orpc.rank.ecosystemsTop.queryOptions({ input: {} }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useReposTopRpc(ecoName = "all") {
  return useQuery({
    ...orpc.rank.reposTop.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useReposTop7dRpc(ecoName = "all") {
  return useQuery({
    ...orpc.rank.reposTop7d.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useReposTopByDev7dRpc(ecoName = "all") {
  return useQuery({
    ...orpc.rank.reposTopByDev7d.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useActorsTopRpc(ecoName = "all") {
  return useQuery({
    ...orpc.rank.actorsTop.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useYearsRankReportRpc() {
  return useQuery({
    ...orpc.rank.yearsRankReport.queryOptions({ input: {} }),
    ...STATS_CACHE_OPTIONS,
  });
}

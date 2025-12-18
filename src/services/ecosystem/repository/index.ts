import type { ResponseResult } from "@/types";
import { isServerSide, generateSuccessResponse } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type {
  RepoRankRecord,
  RepoTrendingRecord,
  ActorRankRecord,
  ActorTrendRecord,
  ActorCountryRankRecord,
  EcoRequestParams,
} from "../../api/typing";

import type { Repository } from "../../repository/typing";

import type { Manager } from "../../admin/typing";

import type {
  Ecosystem,
  EcosystemWithStats,
  RepositoryListParams,
} from "../typing";

async function fetchStatistics(name: string): Promise<
  ResponseResult<{
    developerTotalCount: number | string;
    developerCoreCount: number | string;
    developerGrowthCount: number | string;
    developers: ActorRankRecord[];
    trend: ActorTrendRecord[];
    repositoryTotalCount: number | string;
    repositories: RepoRankRecord[];
    trendingRepositories: RepoTrendingRecord[];
    countryDistribution: ActorCountryRankRecord[];
    countryDistributionTotal: number;
  }>
> {
  // Dynamic import for server-side only
  const {
    fetchRepoCount,
    fetchRepoRankList,
    fetchRepoTrendingList,
    fetchActorCount,
    fetchActorGrowthCount,
    fetchActorRankList,
    fetchActorTrendList,
    fetchActorCountryRankList,
  } = await import("../../api/repository");

  const params = { eco: name } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  const responses = await Promise.all([
    fetchActorCount(params),
    fetchActorCount({ ...params, scope: "Core" }),
    fetchActorGrowthCount(params),
    fetchActorRankList(params),
    fetchActorTrendList(params),
    fetchRepoCount(params),
    fetchRepoRankList(params),
    fetchRepoTrendingList(params),
    fetchActorCountryRankList(params),
  ]);
  const failed = responses.find((res) => !res.success);

  return failed
    ? {
      ...failed,
      data: {
        developerTotalCount: 0,
        developerCoreCount: 0,
        developerGrowthCount: 0,
        developers: [],
        trend: [],
        repositoryTotalCount: 0,
        repositories: [],
        trendingRepositories: [],
        countryDistribution: [],
        countryDistributionTotal: 0,
      },
    }
    : generateSuccessResponse({
      developerTotalCount: responses[0].data.total,
      developerCoreCount: responses[1].data.total,
      developerGrowthCount: responses[2].data.total,
      developers: responses[3].data.list,
      trend: responses[4].data.list,
      repositoryTotalCount: responses[5].data.total,
      repositories: responses[6].data.list,
      trendingRepositories: responses[7].data.list,
      countryDistribution: responses[8].data?.list || [],
      countryDistributionTotal: responses[8].data?.total || 0,
    });
}

async function fetchManageableList(
  _managerId: Manager["id"],
): Promise<ResponseResult<Ecosystem[]>> {
  const { data, ...others } = await fetchManageableEcosystemsWithStats();

  return {
    ...others,
    data: data?.map((eco) => ({ name: eco.eco_name })) || [],
  };
}

async function fetchManageableRepositoryList(
  params: RepositoryListParams,
): Promise<ResponseResult<Repository[]>> {
  if (!isServerSide()) {
    return httpClient.get("/api/ecosystem/repos", { params });
  }

  const { fetchManageableList: fetchManageableRepoListByEco } =
    await import("../../repository/repository");
  return fetchManageableRepoListByEco(params);
}

async function updateManageableRepositoryMark(
  data: EcoRequestParams & { id: number; mark: number },
) {
  if (!isServerSide()) {
    return httpClient.put("/api/ecosystem/repos/mark", data);
  }

  const { updateRepoCustomMark } = await import("../../api/repository");
  return updateRepoCustomMark(data);
}

async function fetchManageableEcosystemsWithStats(): Promise<
  ResponseResult<EcosystemWithStats[]>
  > {
  const { fetchEcosystemRankList } = await import("../../api/repository");
  const { data, ...others } = await fetchEcosystemRankList();

  return {
    ...others,
    data: data?.list || [],
  };
}

export {
  fetchStatistics,
  fetchManageableList,
  fetchManageableRepositoryList,
  updateManageableRepositoryMark,
  fetchManageableEcosystemsWithStats,
};

import type { ResponseResult } from "@/types";
import { isServerSide, generateSuccessResponse } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { RepoRankRecord, ActorRankRecord, ActorTrendRecord, EcoRequestParams } from "../../api/typing";
import {
  fetchRepoCount, fetchRepoRankList,
  fetchActorCount, fetchActorGrowthCount, fetchActorRankList, fetchActorTrendList,
  updateRepoCustomMark,
  fetchEcosystemRankList,
} from "../../api/repository";

import type { Repository } from "../../repository/typing";
import { fetchManageableList as fetchManageableRepoListByEco } from "../../repository/repository";

import type { Manager } from "../../admin/typing";

import type { Ecosystem, EcosystemWithStats, RepositoryListParams } from "../typing";

async function fetchStatistics(name: string): Promise<ResponseResult<{
  developerTotalCount: number | string;
  developerCoreCount: number | string;
  developerGrowthCount: number | string;
  developers: ActorRankRecord[];
  trend: ActorTrendRecord[];
  repositoryTotalCount: number | string;
  repositories: RepoRankRecord[];
}>> {
  const params = { eco: name } as any;  // eslint-disable-line @typescript-eslint/no-explicit-any
  const responses = await Promise.all([
    fetchActorCount(params),
    fetchActorCount({ ...params, scope: "Core" }),
    fetchActorGrowthCount(params),
    fetchActorRankList(params),
    fetchActorTrendList(params),
    fetchRepoCount(params),
    fetchRepoRankList(params),
  ]);
  const failed = responses.find(res => !res.success);

  return failed? {
    ...failed,
    data: {
      developerTotalCount: 0,
      developerCoreCount: 0,
      developerGrowthCount: 0,
      developers: [],
      trend: [],
      repositoryTotalCount: 0,
      repositories: [],
    },
  } : generateSuccessResponse({
    developerTotalCount: responses[0].data.total,
    developerCoreCount: responses[1].data.total,
    developerGrowthCount: responses[2].data.total,
    developers: responses[3].data.list,
    trend: responses[4].data.list,
    repositoryTotalCount: responses[5].data.total,
    repositories: responses[6].data.list,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchManageableList(managerId: Manager["id"]): Promise<ResponseResult<Ecosystem[]>> {
  const { data, ...others } = await fetchManageableEcosystemsWithStats();

  return {
    ...others,
    data: data?.map(eco => ({ name: eco.eco_name })) || [],
  };
}

async function fetchManageableRepositoryList(params: RepositoryListParams): Promise<ResponseResult<Repository[]>> {
  if (!isServerSide()) {
    return httpClient.get("/api/ecosystem/repos", { params });
  }

  return fetchManageableRepoListByEco(params);
}

async function updateManageableRepositoryMark(data: EcoRequestParams & { id: number; mark: number }) {
  if (!isServerSide()) {
    return httpClient.put("/api/ecosystem/repos/mark", data);
  }

  return updateRepoCustomMark(data);
}

async function fetchManageableEcosystemsWithStats(): Promise<ResponseResult<EcosystemWithStats[]>> {
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

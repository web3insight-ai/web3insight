import type { ResponseResult } from "@/types";

import type {
  EcoRequestParams,
  TotalResponseData,
  ListResponseData,
  RepoRankRecord,
  RepoTrendingRecord,
  RepoActiveDeveloperRecord,
} from "../typing";
import httpClient from "./client";

async function fetchTotalCount(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/repos/total", { params: { eco_name: params.eco } });
}

async function fetchRankList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<RepoRankRecord>>> {
  return httpClient.get("/v1/repos/top", { params: { eco_name: params.eco } });
}

async function fetchTrendingList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<RepoTrendingRecord>>> {
  return httpClient.get("/v1/repos/top/7d", { params: { eco_name: params.eco } });
}

async function fetchActiveDeveloperList(
  repoId: number,
): Promise<ResponseResult<ListResponseData<RepoActiveDeveloperRecord>>> {
  return httpClient.get("/v1/repos/active/developer", { params: { repo_id: repoId } });
}

export { fetchTotalCount, fetchRankList, fetchTrendingList, fetchActiveDeveloperList };

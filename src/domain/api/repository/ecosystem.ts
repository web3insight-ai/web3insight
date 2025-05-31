import type { ResponseResult } from "@/types";

import type { PaginatableParams, TotalResponseData, ListResponseData, EcoRequestParams, EcoRankRecord, EcoRepo } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/ecosystems/total");
}

async function fetchRankList(): Promise<ResponseResult<ListResponseData<EcoRankRecord>>> {
  return httpClient.get("/v1/ecosystems/top");
}

async function fetchAdminRepoList(
  params: Partial<PaginatableParams & EcoRequestParams> = {},
): Promise<ResponseResult<ListResponseData<EcoRepo> & TotalResponseData>> {
  const { eco, ...others } = params;

  return httpClient.get("/v1/admin/ecosystems/repos", { params: { ...others, eco_name: eco } });
}

export { fetchTotalCount, fetchRankList, fetchAdminRepoList };

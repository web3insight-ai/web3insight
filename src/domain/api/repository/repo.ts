import type { ResponseResult } from "@/types";

import type { EcoRequestParams, TotalResponseData, ListResponseData, RepoRankRecord } from "../typing";
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

export { fetchTotalCount, fetchRankList };

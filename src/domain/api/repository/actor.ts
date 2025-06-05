import type { ResponseResult } from "@/types";

import type {
  EcoRequestParams, TotalResponseData, ListResponseData,
  ActorRankRecord, ActorTrendRecord,
} from "../typing";
import httpClient from "./client";

async function fetchTotalCount(
  params: Partial<EcoRequestParams & { scope: "ALL" | "Core" }> = {},
): Promise<ResponseResult<TotalResponseData>> {
  const { eco = "ALL", scope = "ALL" } = params;

  return httpClient.get("/v1/actors/total", { params: { eco_name: eco, scope } });
}

async function fetchGrowthCount(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/actors/total/new/quarter/last", { params: { eco_name: params.eco } });
}

async function fetchRankList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<ActorRankRecord>>> {
  return httpClient.get("/v1/actors/top", { params: { eco_name: params.eco } });
}

async function fetchTrendList(
  params: Partial<EcoRequestParams & { period: "week" | "month" }> = {},
): Promise<ResponseResult<ListResponseData<ActorTrendRecord>>> {
  const { eco = "ALL", period = "month" } = params;

  return httpClient.get("/v1/actors/total/date", { params: { eco_name: eco, period } });
}

export { fetchTotalCount, fetchGrowthCount, fetchRankList, fetchTrendList };

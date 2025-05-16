import type { DataValue, ResponseResult } from "@/types";

import type { EcoRequestParams, TotalResponseData, ListResponseData } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(
  params: Partial<EcoRequestParams & { scope: "ALL" | "Core" }> = {},
): Promise<ResponseResult<TotalResponseData>> {
  const { eco = "ALL", scope = "ALL" } = params;

  return httpClient.get("/v1/actors/total", { params: { eco_name: eco, scope } });
}

async function fetchTrendList(
  params: Partial<EcoRequestParams & { period: "week" | "month" }> = {},
): Promise<ResponseResult<ListResponseData<TotalResponseData & { date: string }>>> {
  const { eco = "ALL", period = "month" } = params;

  return httpClient.get("/v1/actors/total/date", { params: { eco_name: eco, period } });
}

async function fetchRankList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<Record<string, DataValue>>>> {
  return httpClient.get("/v1/actors/top", { params: { eco_name: params.eco } });
}

export { fetchTotalCount, fetchTrendList, fetchRankList };

import type { DataValue, ResponseResult } from "@/types";

import type { EcoRequestParams, TotalResponseData, ListResponseData } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(
  params: EcoRequestParams & { scope: "ALL" | "Core" } = { eco: "ALL", scope: "ALL" },
): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/actors/total", { params: { eco_name: params.eco, scope: params.scope } });
}

async function fetchTrendList(
  params: EcoRequestParams & { period: "week" | "month" } = { eco: "ALL", period: "month" },
): Promise<ResponseResult<ListResponseData<TotalResponseData & { date: string }>>> {
  return httpClient.get("/v1/actors/total/date", { params: { eco_name: params.eco, period: params.period } });
}

async function fetchRankList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<Record<string, DataValue>>>> {
  return httpClient.get("/v1/actors/top", { params: { eco_name: params.eco } });
}

export { fetchTotalCount, fetchTrendList, fetchRankList };

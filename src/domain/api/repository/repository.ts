import type { DataValue, ResponseResult } from "@/types";

import type { EcoRequestParams, TotalResponseData, ListResponseData } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/repos/total", { params: { eco_name: params.eco } });
}

async function fetchRankList(
  params: EcoRequestParams = { eco: "ALL" },
): Promise<ResponseResult<ListResponseData<Record<string, DataValue>>>> {
  return httpClient.get("/v1/repos/top", { params: { eco_name: params.eco } });
}

export { fetchTotalCount, fetchRankList };

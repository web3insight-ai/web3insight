import type { DataValue, ResponseResult } from "@/types";

import type { TotalResponseData, ListResponseData } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/ecosystems/total");
}

async function fetchRankList(): Promise<ResponseResult<ListResponseData<Record<string, DataValue>>>> {
  return httpClient.get("/v1/ecosystems/top");
}

export { fetchTotalCount, fetchRankList };

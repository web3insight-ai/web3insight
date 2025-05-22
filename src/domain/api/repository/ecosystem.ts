import type { ResponseResult } from "@/types";

import type { TotalResponseData, ListResponseData, EcoRankRecord } from "../typing";
import httpClient from "./client";

async function fetchTotalCount(): Promise<ResponseResult<TotalResponseData>> {
  return httpClient.get("/v1/ecosystems/total");
}

async function fetchRankList(): Promise<ResponseResult<ListResponseData<EcoRankRecord>>> {
  return httpClient.get("/v1/ecosystems/top");
}

export { fetchTotalCount, fetchRankList };

import type { ResponseResult } from "@/types";

import { httpClient } from "./client";
import { fetchAIStatisticProps } from "../typing";

async function fetchAIStatistic({
  query,
  request_id,
}: fetchAIStatisticProps): Promise<ResponseResult> {
  return httpClient.post("/api/v1/statistic", {
    query,
    request_id,
  });
}

export { fetchAIStatistic };

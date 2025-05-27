import type { ResponseResult } from "@/types";

import { httpClient } from "./client";

async function fetchAnalyzedStatistics({
  query,
  request_id,
}: {
  query: string;
  request_id: string;
}): Promise<ResponseResult> {
  return httpClient.post("/statistic", {
    query,
    request_id,
  });
}

export { fetchAnalyzedStatistics };

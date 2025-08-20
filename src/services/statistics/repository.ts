import { generateSuccessResponse, generateFailedResponse } from "@/clients/http";

import {
  fetchEcosystemCount, fetchEcosystemRankList,
  fetchRepoCount, fetchRepoRankList,
  fetchActorCount, fetchActorRankList,
} from "../api/repository";

// Helper function to safely execute API calls with error handling
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error("API call failed with exception:", error);

    // Check if it's a timeout error
    const isTimeoutError = error instanceof Error &&
      (error.message.includes('timeout') ||
       (error as Error & { cause?: { code?: string } })?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT');

    return generateFailedResponse(
      error instanceof Error ? error.message : "Network request failed",
      isTimeoutError ? "408" : "500",
    ) as T;
  }
}

async function fetchStatisticsOverview() {
  const responses = await Promise.all([
    safeApiCall(() => fetchEcosystemCount()),
    safeApiCall(() => fetchRepoCount()),
    safeApiCall(() => fetchActorCount()),
    safeApiCall(() => fetchActorCount({ scope: "Core" })),
  ]);

  const failedIndex = responses.findIndex(res => !res.success);

  if (failedIndex > -1) {
    const failed = responses[failedIndex];

    console.error("request failed while fetching statistics overview", failedIndex, failed?.code, failed?.message);

    return generateFailedResponse(
      failed?.message || "Failed to fetch statistics overview",
      failed?.code || "500",
      {
        ecosystem: 0,
        repository: 0,
        developer: 0,
        coreDeveloper: 0,
      },
    );
  }

  return generateSuccessResponse({
    ecosystem: responses[0].data.total,
    repository: responses[1].data.total,
    developer: responses[2].data.total,
    coreDeveloper: responses[3].data.total,
  });
}

async function fetchStatisticsRank() {
  const responses = await Promise.all([
    safeApiCall(() => fetchEcosystemRankList()),
    safeApiCall(() => fetchRepoRankList()),
    safeApiCall(() => fetchActorRankList()),
  ]);

  const failed = responses.find(res => !res.success);

  return failed ? generateFailedResponse(
    failed?.message || "Failed to fetch statistics rank",
    failed?.code || "500",
    {
      ecosystem: [],
      repository: [],
      developer: [],
    },
  ) : generateSuccessResponse({
    ecosystem: responses[0].data.list,
    repository: responses[1].data.list,
    developer: responses[2].data.list.slice(0, 10),
  });
}

export { fetchStatisticsOverview, fetchStatisticsRank };

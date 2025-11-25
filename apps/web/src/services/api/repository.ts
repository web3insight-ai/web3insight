import { generateSuccessResponse, generateFailedResponse, type ResponseResult } from "@/clients/http";
import apiClient from "./repository/client";
import type { StatisticsData } from "./typing";

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

// Basic API functions to fetch data (matching web3insight project endpoints)
async function fetchEcosystemCount(): Promise<ResponseResult<{ total: number }>> {
  return apiClient.get('/v1/ecosystems/total');
}

async function fetchRepoCount(): Promise<ResponseResult<{ total: number }>> {
  return apiClient.get('/v1/repos/total', { params: { eco_name: 'ALL' } });
}

async function fetchActorCount(options?: { scope?: string }): Promise<ResponseResult<{ total: number }>> {
  const params: Record<string, string> = { eco_name: 'ALL' };
  if (options?.scope) {
    params.scope = options.scope;
  }
  return apiClient.get('/v1/actors/total', { params });
}

// Main statistics overview function
async function fetchStatisticsOverview(): Promise<ResponseResult<StatisticsData>> {
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

export {
  fetchStatisticsOverview,
  fetchEcosystemCount,
  fetchRepoCount,
  fetchActorCount
};

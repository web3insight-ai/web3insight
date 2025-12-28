import { os } from "@orpc/server"
import { StatisticsDataSchema } from "../schemas"
import apiClient from "@/services/api/repository/client"
import { generateFailedResponse, type ResponseResult } from "@/clients/http"

// Helper function to safely execute API calls with error handling
async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    console.error("API call failed with exception:", error)

    const isTimeoutError =
      error instanceof Error &&
      (error.message.includes("timeout") ||
        (error as Error & { cause?: { code?: string } })?.cause?.code === "UND_ERR_CONNECT_TIMEOUT")

    return generateFailedResponse(
      error instanceof Error ? error.message : "Network request failed",
      isTimeoutError ? "408" : "500"
    ) as T
  }
}

async function fetchEcosystemCount(): Promise<ResponseResult<{ total: number }>> {
  return apiClient.get("/v1/ecosystems/total")
}

async function fetchRepoCount(): Promise<ResponseResult<{ total: number }>> {
  return apiClient.get("/v1/repos/total", { params: { eco_name: "ALL" } })
}

async function fetchActorCount(options?: { scope?: string }): Promise<ResponseResult<{ total: number }>> {
  const params: Record<string, string> = { eco_name: "ALL" }
  if (options?.scope) {
    params.scope = options.scope
  }
  return apiClient.get("/v1/actors/total", { params })
}

export const getStatistics = os.output(StatisticsDataSchema).handler(async () => {
  const responses = await Promise.all([
    safeApiCall(() => fetchEcosystemCount()),
    safeApiCall(() => fetchRepoCount()),
    safeApiCall(() => fetchActorCount()),
    safeApiCall(() => fetchActorCount({ scope: "Core" })),
  ])

  const failedIndex = responses.findIndex((res) => !res.success)

  if (failedIndex > -1) {
    const failed = responses[failedIndex]
    console.error("request failed while fetching statistics overview", failedIndex, failed?.code, failed?.message)
    // Return default values on failure
    return {
      ecosystem: 0,
      repository: 0,
      developer: 0,
      coreDeveloper: 0,
    }
  }

  return {
    ecosystem: Number(responses[0].data.total),
    repository: Number(responses[1].data.total),
    developer: Number(responses[2].data.total),
    coreDeveloper: Number(responses[3].data.total),
  }
})

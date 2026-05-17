import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@env";
import {
  generateSuccessResponse,
  generateFailedResponse,
  type ResponseResult,
} from "@/clients/http";
import type { StatisticsData } from "./typing";

// Reason: typed oRPC client to the Hono backend (apps/api /rpc/*). Replaces
// the legacy REST `apiClient.get('/v1/...')` pattern. Single static-token
// instance — web is read-only/anonymous and only hits unauth procedures.
const { client } = createWeb3InsightClient({
  url: `${env.DATA_API_URL}/rpc`,
  token: env.DATA_API_TOKEN,
  credentials: "omit",
  timeoutMs:
    typeof env.HTTP_TIMEOUT === "number"
      ? env.HTTP_TIMEOUT
      : parseInt(String(env.HTTP_TIMEOUT), 10),
});

async function safeOrpc<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<ResponseResult<T>> {
  try {
    const data = await fn();
    return generateSuccessResponse(data);
  } catch (error) {
    const errObj = error as { status?: number; message?: string } | null;
    const code = errObj?.status ? String(errObj.status) : "500";
    const isTimeout =
      error instanceof Error &&
      (error.message.includes("timeout") ||
        (error as Error & { cause?: { code?: string } })?.cause?.code ===
          "UND_ERR_CONNECT_TIMEOUT");
    const message =
      error instanceof Error ? error.message : "Network request failed";
    return generateFailedResponse(
      message,
      isTimeout ? "408" : code,
      fallback,
    );
  }
}

async function fetchEcosystemCount(): Promise<
  ResponseResult<{ total: number }>
> {
  return safeOrpc(() => client.total.ecosystems({}), { total: 0 });
}

async function fetchRepoCount(): Promise<ResponseResult<{ total: number }>> {
  return safeOrpc(() => client.total.repos({ eco_name: "ALL" }), { total: 0 });
}

async function fetchActorCount(options?: {
  scope?: string;
}): Promise<ResponseResult<{ total: number }>> {
  return safeOrpc(
    () =>
      client.total.actors({
        eco_name: "ALL",
        scope: (options?.scope ?? "ALL") as never,
      } as never),
    { total: 0 },
  );
}

async function fetchStatisticsOverview(): Promise<
  ResponseResult<StatisticsData>
> {
  const responses = await Promise.all([
    fetchEcosystemCount(),
    fetchRepoCount(),
    fetchActorCount(),
    fetchActorCount({ scope: "Core" }),
  ]);

  const failedIndex = responses.findIndex((res) => !res.success);

  if (failedIndex > -1) {
    const failed = responses[failedIndex];
    console.error(
      "request failed while fetching statistics overview",
      failedIndex,
      failed?.code,
      failed?.message,
    );
    return generateFailedResponse(
      failed?.message || "Failed to fetch statistics overview",
      failed?.code || "500",
      { ecosystem: 0, repository: 0, developer: 0, coreDeveloper: 0 },
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
  fetchActorCount,
};

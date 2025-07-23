import type { DataValue, ResponseResult } from "@/types";
import { type NormalizedPagination, resolvePaginationParams, isServerSide } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { User as GithubUser } from "../github/typing";
import { fetchAnalysisUserList, analyzeUserList, fetchAnalysisUser } from "../api/repository";

import type { EventReport } from "./typing";
import { resolveEventDetail } from "./helper";

async function fetchList(
  params: NormalizedPagination,
): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.get("/api/event/contestants", { params });
  }

  const { pageSize, pageNum } = params;

  try {
    const { data, extra, ...others } = await fetchAnalysisUserList({
      ...resolvePaginationParams({ pageSize, pageNum }),
    });

    return {
      ...others,
      data: data.list,
      extra: {
        ...extra,
        total: data?.total ? Number(data.total) : 0,
      },
    };
  } catch (error) {
    console.error(`[Event Repository] fetchList error:`, error);
    throw error;
  }
}

async function fetchOne(id: number): Promise<ResponseResult<EventReport>> {
  if (!isServerSide()) {
    return httpClient.get(`/api/event/contestants/${id}`);
  }

  let res: ResponseResult<Record<string, DataValue>>;
  let dataNotReady: boolean;
  let retryCount = 0;
  const maxRetries = 10;

  do {
    try {
      res = await fetchAnalysisUser(id);
    } catch (error) {
      console.error(`[Event Repository] fetchAnalysisUser attempt ${retryCount + 1} error:`, error);
      res = {
        success: false,
        code: "500",
        message: `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {},
      };
    }

    const delayed = new Promise<boolean>((resolve) => {
      // Check if the response is successful and has the expected data structure
      const hasCompleteData = res.success &&
        Number(res.code) === 200 &&
        res.data &&
        res.data.data &&
        res.data.data.users &&
        Array.isArray(res.data.data.users) &&
        res.data.data.users.length > 0 &&
        res.data.data.users[0].ecosystem_scores &&
        Array.isArray(res.data.data.users[0].ecosystem_scores) &&
        res.data.data.users[0].ecosystem_scores.length > 0;

      const notReady = !hasCompleteData;

      if (retryCount === 0) {
        resolve(notReady);
      } else {
        console.log(`[Event Repository] Polling attempt ${retryCount + 1}, data ready: ${hasCompleteData}`);
        setTimeout(() => {
          resolve(notReady);
        }, 10000); // Poll every 10 seconds
      }
    });

    dataNotReady = await delayed;
    retryCount += 1;
  } while (dataNotReady && retryCount < maxRetries);

  if (dataNotReady) {
    console.error(`[Event Repository] Failed to fetch analysis data after ${maxRetries} attempts`);
    res.success = false;
    res.code = "500";
    res.message = "Failed to fetch analysis data, please try again later.";
  }

  try {
    const eventReport = resolveEventDetail(res.data);

    return {
      ...res,
      data: eventReport,
    };
  } catch (error) {
    console.error(`[Event Repository] Error resolving event detail:`, error);
    throw error;
  }
}

async function insertOne(
  data: {
    managerId: string;
    urls: string[];
    description: string;
  },
): Promise<ResponseResult<GithubUser[]>> {
  if (!isServerSide()) {
    return httpClient.post("/api/event/contestants", data);
  }

  try {
    const response = await analyzeUserList({
      request_data: data.urls,
      intent: "hackathon",
      description: data.description,
    });

    // Handle API error response
    if (!response.success || !response.data) {
      console.error(`[Event Repository] analyzeUserList failed:`, response);
      return {
        success: response.success,
        code: response.code,
        message: response.message,
        data: [] as GithubUser[],
      };
    }

    const { data: resData, extra, ...others } = response;
    const { id, users, ...rest } = resData;

    return {
      ...others,
      data: users,
      extra: { ...extra, eventId: id, ...rest },
    };
  } catch (error) {
    console.error(`[Event Repository] insertOne error:`, error);
    throw error;
  }
}

export { fetchList, fetchOne, insertOne };

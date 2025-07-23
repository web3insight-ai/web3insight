import type { DataValue, ResponseResult } from "@/types";
import { type NormalizedPagination, resolvePaginationParams, isServerSide } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { User as GithubUser } from "../github/typing";
import { fetchAnalysisUserList, analyzeUserList, fetchAnalysisUser } from "../api/repository";

import type { EventReport } from "./typing";
import { resolveEventDetail } from "./helper";

async function fetchList(
  params: NormalizedPagination & {
    managerId: string;
  },
): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.get("/api/event/contestants", { params });
  }

  const { managerId, pageSize, pageNum } = params;
  const { data, extra, ...others } = await fetchAnalysisUserList({
    ...resolvePaginationParams({ pageSize, pageNum }),
    submitter_id: managerId,
  });

  return {
    ...others,
    data: data.list,
    extra: {
      ...extra,
      total: data?.total ? Number(data.total) : 0,
    },
  };
}

async function fetchOne(id: number): Promise<ResponseResult<EventReport>> {
  if (!isServerSide()) {
    return httpClient.get(`/api/event/contestants/${id}`);
  }

  let res: ResponseResult<Record<string, DataValue>>;
  let dataNotReady: boolean;
  let retryCount = 0;

  do {
    res = await fetchAnalysisUser(id);

    const delayed = new Promise<boolean>((resolve) => {
      const notReady = res.success && (Number(res.code) !== 200 || !res.data || !res.data.data || !res.data.data.users);

      if (retryCount === 0) {
        resolve(notReady);
      } else {
        setTimeout(() => {
          resolve(notReady);
        }, 10000);
      }
    });

    dataNotReady = await delayed;
    retryCount += 1;
  } while (dataNotReady && retryCount < 10);

  if (dataNotReady) {
    res.success = false;
    res.code = "500";
    res.message = "Failed to fetch analysis data, please try again later.";
    
  }

  return {
    ...res,
    data: resolveEventDetail(res.data),
  };
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

  const response = await analyzeUserList({
    submitter_id: data.managerId,
    request_data: data.urls,
    intent: "hackathon",
    description: data.description,
  });

  // Handle API error response
  if (!response.success || !response.data) {
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
}

export { fetchList, fetchOne, insertOne };

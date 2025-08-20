import type { DataValue, ResponseResult } from "@/types";
import { type NormalizedPagination, resolvePaginationParams, isServerSide } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { User as GithubUser } from "../github/typing";
import { fetchAnalysisUserList, analyzeUserList, fetchAnalysisUser, updateAnalysisUser } from "../api/repository";
import { getSession } from "../auth/helper/server";

import type { EventReport } from "./typing";
import { resolveEventDetail } from "./helper";

async function fetchList(
  requestOrParams: Request | NormalizedPagination,
  params?: NormalizedPagination,
): Promise<ResponseResult> {
  // Handle client-side calls (first parameter is params object)
  if (!isServerSide()) {
    const clientParams = requestOrParams as NormalizedPagination;
    return httpClient.get("/api/event/contestants", { params: clientParams });
  }

  // Handle server-side calls (first parameter is request, second is params)
  const request = requestOrParams as Request;
  const serverParams = params!;

  // Get user token from session
  const session = await getSession(request);
  const userToken = session.get("userToken");

  if (!userToken) {
    return {
      success: false,
      code: "401",
      message: "Authentication required",
      data: [],
    };
  }

  const { pageSize, pageNum } = serverParams;

  try {
    const { data, extra, ...others } = await fetchAnalysisUserList(userToken, {
      ...resolvePaginationParams({ pageSize, pageNum }),
      direction: "desc",
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

async function fetchOne(requestOrId: Request | number, id?: number): Promise<ResponseResult<EventReport>> {
  // Handle client-side calls (first parameter is id)
  if (!isServerSide()) {
    const clientId = requestOrId as number;
    return httpClient.get(`/api/event/contestants/${clientId}`);
  }

  // Handle server-side calls (first parameter is request, second is id)
  const request = requestOrId as Request;
  const serverId = id!;

  // Get user token from session
  const session = await getSession(request);
  const userToken = session.get("userToken");

  if (!userToken) {
    return {
      success: false,
      code: "401",
      message: "Authentication required",
      data: {} as EventReport,
    };
  }

  let res: ResponseResult<Record<string, DataValue>>;
  let dataNotReady: boolean;
  let retryCount = 0;
  const maxRetries = 10;

  do {
    try {
      res = await fetchAnalysisUser(userToken, serverId);
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
  requestOrData: Request | { urls: string[]; description: string },
  data?: { urls: string[]; description: string },
): Promise<ResponseResult<GithubUser[]>> {
  // Handle client-side calls (first parameter is data)
  if (!isServerSide()) {
    const clientData = requestOrData as { urls: string[]; description: string };
    return httpClient.post("/api/event/contestants", clientData);
  }

  // Handle server-side calls (first parameter is request, second is data)
  const request = requestOrData as Request;
  const serverData = data!;

  // Get user token from session
  const session = await getSession(request);
  let userToken = session.get("userToken");

  // TEMPORARY: Check for test token in headers for development/testing
  const testTokenHeader = request.headers.get('x-test-token');
  if (testTokenHeader && !userToken) {
    console.log('🧪 Using test token for event creation');
    userToken = testTokenHeader;
  }

  if (!userToken) {
    return {
      success: false,
      code: "401",
      message: "Authentication required",
      data: [] as GithubUser[],
    };
  }

  try {
    const response = await analyzeUserList(userToken, {
      request_data: serverData.urls,
      intent: "hackathon",
      description: serverData.description,
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

async function updateOne(
  requestOrData: Request | { id: number; urls: string[]; description: string },
  data?: { id: number; urls: string[]; description: string },
): Promise<ResponseResult<GithubUser[]>> {
  // Handle client-side calls (first parameter is data)
  if (!isServerSide()) {
    const clientData = requestOrData as { id: number; urls: string[]; description: string };
    return httpClient.post(`/api/event/contestants/${clientData.id}`, {
      urls: clientData.urls,
      description: clientData.description,
    });
  }

  // Handle server-side calls (first parameter is request, second is data)
  const request = requestOrData as Request;
  const serverData = data!;

  // Get user token from session
  const session = await getSession(request);
  const userToken = session.get("userToken");

  if (!userToken) {
    return {
      success: false,
      code: "401",
      message: "Authentication required",
      data: [] as GithubUser[],
    };
  }

  try {
    const response = await updateAnalysisUser(userToken, serverData.id, {
      request_data: serverData.urls,
      intent: "hackathon",
      description: serverData.description,
    });

    // Handle API error response
    if (!response.success || !response.data) {
      console.error(`[Event Repository] updateAnalysisUser failed:`, response);
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
    console.error(`[Event Repository] updateOne error:`, error);
    throw error;
  }
}

export { fetchList, fetchOne, insertOne, updateOne };

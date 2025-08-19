import type { ResponseResult } from "@/types";
import type { SqlStylePagination } from "@/clients/http";
import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";
import { getHttpTimeout } from "@/utils/env";

import type { User as GithubUser } from "../../github/typing";

import type { TotalResponseData, ListResponseData } from "../typing";

// Create authenticated HTTP client factory
function createAuthenticatedClient(userToken: string) {
  const httpTimeout = getHttpTimeout();

  const baseClient = new HttpClient({
    baseURL: process.env.DATA_API_URL,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    normalizer: normalizeRestfulResponse,
  });

  return {
    get: (url: string, config: Record<string, unknown> = {}) => {
      if (!config.signal) {
        config.signal = AbortSignal.timeout(httpTimeout);
      }
      return baseClient.get(url, config);
    },
    post: (url: string, data?: Record<string, unknown>, config: Record<string, unknown> = {}) => {
      if (!config.signal) {
        config.signal = AbortSignal.timeout(httpTimeout);
      }
      return baseClient.post(url, data, config);
    },
  };
}

async function fetchAnalysisUserList(
  userToken: string,
  params: Partial<SqlStylePagination> & {
    direction?: string;
  },
): Promise<ResponseResult<ListResponseData & TotalResponseData>> {
  const client = createAuthenticatedClient(userToken);
  return client.get("/v1/custom/analysis/users", { params });
}

async function analyzeUserList(
  userToken: string,
  data: {
    request_data: string[];
    intent: string;
    description?: string;
  },
): Promise<ResponseResult<{
  id: number;
  users: GithubUser[];
}>> {
  const client = createAuthenticatedClient(userToken);
  return client.post("/v1/custom/analysis/users", data);
}

async function fetchAnalysisUser(userToken: string, id: number): Promise<ResponseResult> {
  const client = createAuthenticatedClient(userToken);
  return client.get(`/v1/custom/analysis/users/${id}`);
}

async function updateAnalysisUser(
  userToken: string,
  id: number,
  data: {
    request_data: string[];
    intent: string;
    description?: string;
  },
): Promise<ResponseResult<{
  id: number;
  users: GithubUser[];
}>> {
  const client = createAuthenticatedClient(userToken);
  return client.post(`/v1/custom/analysis/users/${id}`, data);
}

export { fetchAnalysisUserList, analyzeUserList, fetchAnalysisUser, updateAnalysisUser };

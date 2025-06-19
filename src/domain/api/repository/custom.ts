import type { ResponseResult } from "@/types";
import type { SqlStylePagination } from "@/clients/http";

import type { User as GithubUser } from "../../github/typing";

import type { TotalResponseData, ListResponseData } from "../typing";
import httpClient from "./client";

async function fetchAnalysisUserList(
  params: Partial<SqlStylePagination> & {
    submitter_id: string;
    direction?: string;
  },
): Promise<ResponseResult<ListResponseData & TotalResponseData>> {
  return httpClient.get("/v1/custom/analysis/users", { params });
}

async function analyzeUserList(
  data: {
    submitter_id: string;
    request_data: string[];
    intent: string;
    description?: string;
  },
): Promise<ResponseResult<{
  id: number;
  users: GithubUser[];
}>> {
  return httpClient.post("/v1/custom/analysis/users", data);
}

async function fetchAnalysisUser(id: number): Promise<ResponseResult> {
  return httpClient.get(`/v1/custom/analysis/users/${id}`);
}

export { fetchAnalysisUserList, analyzeUserList, fetchAnalysisUser };

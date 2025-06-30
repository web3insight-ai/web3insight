import type { ResponseResult } from "@/types";
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

  const { data, ...others } = await fetchAnalysisUser(id);

  return {
    ...others,
    data: resolveEventDetail(data),
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

  const { data: resData, extra, ...others } = await analyzeUserList({
    submitter_id: data.managerId,
    request_data: data.urls,
    intent: "hackathon",
    description: data.description,
  });
  const { id, users, ...rest } = resData;

  return {
    ...others,
    data: users,
    extra: { ...extra, eventId: id, ...rest },
  };
}

export { fetchList, fetchOne, insertOne };

import type { ResponseResult } from "@/types";
import { type NormalizedPagination, resolvePaginationParams, isServerSide } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { User as GithubUser } from "../github/typing";
import { fetchAnalysisUserList, analyzeUserList } from "../api/repository";

async function fetchContestantList(
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

async function insertContestantList(
  data: {
    managerId: string;
    urls: string[];
  },
): Promise<ResponseResult<GithubUser[]>> {
  if (!isServerSide()) {
    return httpClient.post("/api/event/contestants", data);
  }

  const { data: resData, ...others } = await analyzeUserList({
    submitter_id: data.managerId,
    request_data: data.urls,
    intent: "hackathon",
    description: `${data.managerId} submmitted`,
  });

  return { ...others, data: resData.users };
}

export { fetchContestantList, insertContestantList };

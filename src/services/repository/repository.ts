import type { ResponseResult } from "@/types";
import { generateSuccessResponse, resolvePaginationParams } from "@/clients/http";

import { fetchRepoListByUserLogin } from "../github/repository";
import { fetchAdminRepoList, fetchRepoTrendingList } from "../api/repository";

import type { RepoTrendingRecord } from "../api/typing";
import type { Repository, ManageableListParams } from "./typing";

async function fetchListByDeveloper(username: string): Promise<ResponseResult<Repository[]>> {
  const { data, ...others } = await fetchRepoListByUserLogin(username);

  return {
    ...others,
    data: data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      statistics: {
        star: repo.stargazers_count,
        fork: repo.forks_count,
        watch: repo.watchers_count,
        openIssue: repo.open_issues_count,
        contributor: -1,
      },
    })),
  };
}

async function fetchListByEcosystem(name: string): Promise<ResponseResult<Repository[]>> {
  return Promise.resolve(generateSuccessResponse(Array.from({ length: 10 }, (_, index) => {
    const num = index + 1;

    return {
      id: num,
      name: `repo${num}`,
      fullName: `repo${num}`,
      description: `repo${num} of ${name}`,
      statistics: { star: 1, fork: 1, watch: 1, openIssue: 1, contributor: 1 },
    };
  })));
}

async function fetchManageableList(
  { pageSize, pageNum, ...rest }: ManageableListParams,
): Promise<ResponseResult<Repository[]>> {
  const { data, extra, ...others } = await fetchAdminRepoList({
    ...rest,
    ...resolvePaginationParams({ pageSize, pageNum }),
  });

  return {
    ...others,
    data: data.list ? data.list.map(item => ({
      id: item.repo_id,
      name: item.repo_name,
      fullName: item.repo_name,
      description: "",
      statistics: { star: -1, fork: -1, watch: -1, openIssue: -1, contributor: -1 },
      customMark: item.custom_marks[rest.eco] || -1,
    })) : [],
    extra: {
      ...extra,
      total: data.total,
    },
  };
}

async function fetchWeeklyTrendingList(eco: string = "ALL"): Promise<ResponseResult<RepoTrendingRecord[]>> {
  const response = await fetchRepoTrendingList({ eco });

  if (!response.success) {
    return {
      success: false,
      message: response.message,
      code: response.code,
      extra: response.extra,
      data: [],
    };
  }

  return {
    success: true,
    message: response.message,
    code: response.code,
    extra: response.extra,
    data: response.data.list ?? [],
  };
}

export { fetchListByDeveloper, fetchListByEcosystem, fetchManageableList, fetchWeeklyTrendingList };

import type { ResponseResult } from "@/types";
import { generateSuccessResponse } from "@/clients/http";

import type { Repository } from "./typing";

import { fetchRepoListByUserLogin } from "../github/repository";

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
      statistics: { star: 1, fork: 1, watch: 1, openIssue: 1 },
    };
  })));
}

export { fetchListByDeveloper, fetchListByEcosystem };

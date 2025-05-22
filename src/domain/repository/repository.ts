import type { ResponseResult } from "@/types";

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

export { fetchListByDeveloper };

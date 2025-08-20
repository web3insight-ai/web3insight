import type { ResponseResult } from "@/types";
import { isNumeric } from "@/utils";

import { fetchUser, fetchUserById, fetchPersonalOverview, fetchPersonalContributionTrends } from "../ossinsight/repository";
import { fetchPublicEventListByUserLogin } from "../github/repository";

import type { Repository } from "../repository/typing";
import { fetchListByDeveloper } from "../repository/repository";

import type { Developer, DeveloperActivity, DeveloperContribution } from "./typing";
import { resolveActivityFromGithubEvent, resolveDeveloperFromGithubUser } from "./helper";

async function fetchOne(idOrUsername: number | string): Promise<ResponseResult<Developer | null>> {
  const { data, ...others } = isNumeric(idOrUsername) ? await fetchUserById(idOrUsername) : await fetchUser(<string>idOrUsername);

  if (!others.success) {
    return {
      ...others,
      code: others.message && others.message.toLowerCase().indexOf("not found") > -1 ? "404" : others.code,
      data: null,
    };
  }

  const { data: statistics, ...rest } = await fetchPersonalOverview(data.id);

  if (!rest.success) {
    return { ...rest, data: null  };
  }

  return {
    ...others,
    data: others.success? {
      ...resolveDeveloperFromGithubUser(data),
      statistics: {
        repository: data.public_repos,
        pullRequest: statistics[0].pull_requests,
        codeReview: statistics[0].code_reviews,
      },
    } : null,
  };
}

async function fetchRepositoryRankList(username: string): Promise<ResponseResult<Repository[]>> {
  const { data, ...others } = await fetchListByDeveloper(username);

  return {
    ...others,
    data: data.sort((a, b) => a.statistics.star >= b.statistics.star ? -1 : 1).slice(0, 10),
  };
}

async function fetchActivityList(username: string): Promise<ResponseResult<DeveloperActivity[]>> {
  const { data, ...others } = await fetchPublicEventListByUserLogin(username);

  return {
    ...others,
    data: others.success ? data.map(resolveActivityFromGithubEvent) : [],
  };
}

async function fetchContributionList(id: number): Promise<ResponseResult<DeveloperContribution[]>> {
  const { data,...others } = await fetchPersonalContributionTrends(id);

  return {
    ...others,
    data: others.success
      ? data
        .filter(({ contribution_type }) => contribution_type === "pushes")
        .map(({ event_month, cnt }) => ({ date: event_month, total: cnt }))
        .slice(-10)
        .reverse()
      : [],
  };
}

export { fetchOne, fetchRepositoryRankList, fetchActivityList, fetchContributionList };

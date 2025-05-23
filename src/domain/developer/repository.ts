import type { ResponseResult } from "@/types";
import { isNumeric } from "@/utils";

import { fetchUser, fetchUserById, fetchPersonalOverview, fetchPersonalContributionTrends } from "../ossinsight/repository";
import { fetchGithubUserActivity } from "../rsshub/repository";

import type { Repository } from "../repository/typing";
import { fetchListByDeveloper } from "../repository/repository";

import type { Developer, DeveloperActivity, DeveloperContribution } from "./typing";

async function fetchOne(idOrUsername: number | string): Promise<ResponseResult<Developer | null>> {
  const { data, ...others } = isNumeric(idOrUsername) ? await fetchUserById(idOrUsername) : await fetchUser(<string>idOrUsername);

  if (!others.success) {
    return { ...others, data: null  };
  }

  const { data: statistics, ...rest } = await fetchPersonalOverview(data.id);

  if (!rest.success) {
    return { ...rest, data: null  };
  }

  return {
    ...others,
    data: others.success? {
      id: data.id,
      username: data.login,
      nickname: data.name,
      description: data.bio,
      avatar: data.avatar_url,
      location: data.location,
      social: {
        github: data.html_url,
        twitter: data.twitter_username,
        website: data.blog,
      },
      statistics: {
        repository: data.public_repos,
        pullRequest: statistics[0].pull_requests,
        codeReview: statistics[0].code_reviews,
      },
      joinedAt: data.created_at,
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
  const { data, ...others } = await fetchGithubUserActivity(username);

  return {
    ...others,
    data: others.success ? data.items.map(item => ({
      id: item.id,
      description: item.title,
      date: item.date_published,
    })) : [],
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

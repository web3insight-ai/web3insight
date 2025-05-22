import type { ResponseResult } from "@/types";
import { isNumeric } from "@/utils";

import { fetchUser, fetchUserById, fetchPersonalOverview } from "../ossinsight/repository";
import { fetchListByDeveloper } from "../repository/repository";
import type { Repository } from "../repository/typing";
import type { Developer } from "./typing";

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

export { fetchOne, fetchRepositoryRankList };

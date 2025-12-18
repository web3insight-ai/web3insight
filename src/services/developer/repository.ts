import type { ResponseResult } from "@/types";
import { isNumeric } from "@/utils";
import httpClient from "~/api/repository/client";

import {
  fetchUser,
  fetchUserById,
  fetchPersonalOverview,
  fetchPersonalContributionTrends,
} from "../ossinsight/repository";
import { fetchPublicEventListByUserLogin } from "../github/repository";

import type { Repository } from "../repository/typing";
import { fetchListByDeveloper } from "../repository/repository";

import type {
  Developer,
  DeveloperActivity,
  DeveloperContribution,
  DeveloperEcosystems,
  EcosystemInfo,
} from "./typing";
import {
  resolveActivityFromGithubEvent,
  resolveDeveloperFromGithubUser,
} from "./helper";

async function fetchOne(
  idOrUsername: number | string,
): Promise<ResponseResult<Developer | null>> {
  const { data, ...others } = isNumeric(idOrUsername)
    ? await fetchUserById(idOrUsername)
    : await fetchUser(<string>idOrUsername);

  if (!others.success) {
    const errorCode =
      others.message && others.message.toLowerCase().indexOf("not found") > -1
        ? "404"
        : others.code;
    return {
      ...others,
      code: errorCode,
      data: null,
    };
  }

  const { data: statistics, ...rest } = await fetchPersonalOverview(data.id);

  if (!rest.success) {
    return {
      ...rest,
      data: null,
    };
  }

  if (!others.success) {
    return {
      ...others,
      data: null,
    };
  }

  const developerData = {
    ...resolveDeveloperFromGithubUser(data),
    statistics: {
      repository: data.public_repos,
      pullRequest: statistics[0].pull_requests,
      codeReview: statistics[0].code_reviews,
    },
  };

  return {
    ...others,
    data: developerData,
  };
}

async function fetchRepositoryRankList(
  username: string,
): Promise<ResponseResult<Repository[]>> {
  const { data, ...others } = await fetchListByDeveloper(username);

  return {
    ...others,
    data: data
      .sort((a, b) => (a.statistics.star >= b.statistics.star ? -1 : 1))
      .slice(0, 10),
  };
}

async function fetchActivityList(
  username: string,
): Promise<ResponseResult<DeveloperActivity[]>> {
  const { data, ...others } = await fetchPublicEventListByUserLogin(username);

  return {
    ...others,
    data: others.success ? data.map(resolveActivityFromGithubEvent) : [],
  };
}

async function fetchContributionList(
  id: number,
): Promise<ResponseResult<DeveloperContribution[]>> {
  const { data, ...others } = await fetchPersonalContributionTrends(id);

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

interface EcoScoreApiResponse {
  actor_id?: string;
  actor_login?: string;
  eco_score?: {
    ecosystems?: Array<{
      ecosystem: string;
      total_score?: number;
      repos?: Array<{
        repo_name: string;
        score: number;
      }>;
      first_activity_at?: string;
      last_activity_at?: string;
    }>;
    total_score?: number;
    updated_at?: string;
  };
}

async function fetchEcosystems(
  id: number,
): Promise<ResponseResult<DeveloperEcosystems | null>> {
  try {
    const response = await httpClient.get<EcoScoreApiResponse>(
      `/v2/external/github/users/id/${id}`,
    );

    if (!response.success || !response.data) {
      return {
        success: false,
        message: response.message || "Failed to fetch ecosystems",
        data: null,
      };
    }

    const ecoScore = response.data.eco_score;
    if (!ecoScore || !ecoScore.ecosystems || ecoScore.ecosystems.length === 0) {
      return {
        success: true,
        data: { ecosystems: [], totalScore: 0 },
      };
    }

    const ecosystems: EcosystemInfo[] = ecoScore.ecosystems.map((eco) => ({
      ecosystem: eco.ecosystem,
      totalScore: eco.total_score,
      repoCount: eco.repos?.length || 0,
      firstActivityAt: eco.first_activity_at,
      lastActivityAt: eco.last_activity_at,
    }));

    return {
      success: true,
      data: {
        ecosystems,
        totalScore: ecoScore.total_score,
      },
    };
  } catch (error) {
    console.error("[Developer] Failed to fetch ecosystems:", error);
    return {
      success: false,
      message: "Failed to fetch ecosystems",
      data: null,
    };
  }
}

export {
  fetchOne,
  fetchRepositoryRankList,
  fetchActivityList,
  fetchContributionList,
  fetchEcosystems,
};

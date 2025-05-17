import { isAddress } from "viem";

import type { DataValue, ResponseResult } from "@/types";
import { generateSuccessResponse } from "@/clients/http";
import redis from "@/clients/redis";

import { fetchDecentralizedActivityList } from "../rss3/repository";
import { fetchUser, fetchRepo } from "../ossinsight/repository";
import {
  fetchRepoOpenrank, fetchRepoCommunityOpenrank,
  fetchRepoAttention,
  fetchRepoParticipants, fetchRepoNewContributors, fetchRepoInactiveContributors,
} from "../opendigger/repository";
import { fetchEcosystem } from "../strapi/repository";
import type { RepositoryRankRecord, DeveloperRankRecord, DeveloperTrendRecord } from "../api/typing";
import {
  fetchRepositoryCount, fetchRepositoryRankList,
  fetchDeveloperCount, fetchDeveloperRankList, fetchDeveloperTrendList,
} from "../api/repository";

async function fetchOne(keyword?: string): Promise<ResponseResult<Record<string, DataValue> | null>> {
  return fetchEcosystem(keyword);
}

async function getEVMInfo(address: string) {
  try {
    return fetchDecentralizedActivityList(address);
  } catch (error) {
    console.error("Error fetching EVM info:", error);
    return null;
  }
}

async function getGitHubRepoInfo(repo: string) {
  const key = `github:repo:${repo}`;
  const cached = await redis.get(key);

  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (Object.keys(parsedCache).length !== 0) {
      return parsedCache;
    }
  }

  try {
    const { data } = await fetchRepo(repo);

    await redis.set(key, JSON.stringify(data), "EX", 60 * 60 * 24 * 2);
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo info:", error);
    return null;
  }
}

async function getGitHubUserInfo(user: string) {
  const key = `github:user:${user}`;
  const cached = await redis.get(key);

  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (Object.keys(parsedCache).length !== 0) {
      return parsedCache;
    }
  }

  try {
    const { data } = await fetchUser(user);

    await redis.set(key, JSON.stringify(data), "EX", 60 * 60 * 24 * 2);
    return data;
  } catch (error) {
    console.error("Error fetching GitHub user info:", error);
    return null;
  }
}

async function getInfo(query: string) {
  if (isAddress(query) || query.endsWith(".eth")) {
    return getEVMInfo(query);
  } else if (query.includes("/")) {
    return getGitHubRepoInfo(query);
  } else {
    return getGitHubUserInfo(query);
  }
}

async function fetchRepoAnalysis(repo: string) {
  const [
    { data: openrank },
    communityOpenrankRes,
    { data: attention },
    { data: participants },
    { data: newContributors },
    { data: inactiveContributors },
  ] = await Promise.all([
    fetchRepoOpenrank(repo),
    fetchRepoCommunityOpenrank(repo),
    fetchRepoAttention(repo),
    fetchRepoParticipants(repo),
    fetchRepoNewContributors(repo),
    fetchRepoInactiveContributors(repo),
  ]);

  return generateSuccessResponse({
    openrank,
    communityOpenrank: { data: communityOpenrankRes.data, ...communityOpenrankRes.extra },
    attention,
    participants,
    newContributors,
    inactiveContributors,
  });
}

async function fetchStatistics(name: string): Promise<ResponseResult<{
  developerTotalCount: number | string;
  developerCoreCount: number | string;
  developers: DeveloperRankRecord[];
  repositories: RepositoryRankRecord[];
  trend: DeveloperTrendRecord[];
}>> {
  const params = { eco: name } as any;  // eslint-disable-line @typescript-eslint/no-explicit-any
  const responses = await Promise.all([
    fetchDeveloperCount(params),
    fetchRepositoryCount({ ...params, scope: "Core" }),
    fetchDeveloperTrendList(params),
    fetchDeveloperRankList(params),
    fetchRepositoryRankList(params),
  ]);
  const failed = responses.find(res => !res.success);

  return failed? {
   ...failed,
    data: {
      developerTotalCount: 0,
      developerCoreCount: 0,
      developers: [],
      repositories: [],
      trend: [],
    },
  } : generateSuccessResponse({
    developerTotalCount: responses[0].data.total,
    developerCoreCount: responses[1].data.total,
    developers: responses[3].data.list,
    repositories: responses[4].data.list,
    trend: responses[2].data.list,
  });
}

export { fetchOne, getInfo, fetchRepoAnalysis, fetchStatistics };

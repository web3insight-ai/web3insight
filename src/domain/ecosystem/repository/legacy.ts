import { isAddress } from "viem";

import type { DataValue, ResponseResult } from "@/types";
import { generateSuccessResponse } from "@/clients/http";
import redis from "@/clients/redis";

import { fetchDecentralizedActivityList } from "../../rss3/repository";
import { fetchUser, fetchRepo } from "../../ossinsight/repository";
import {
  fetchRepoOpenrank, fetchRepoCommunityOpenrank,
  fetchRepoAttention,
  fetchRepoParticipants, fetchRepoNewContributors, fetchRepoInactiveContributors,
} from "../../opendigger/repository";
import { fetchEcosystem } from "../../strapi/repository";

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
  try {
    const [
      openrankRes,
      communityOpenrankRes,
      attentionRes,
      participantsRes,
      newContributorsRes,
      inactiveContributorsRes,
    ] = await Promise.allSettled([
      fetchRepoOpenrank(repo),
      fetchRepoCommunityOpenrank(repo),
      fetchRepoAttention(repo),
      fetchRepoParticipants(repo),
      fetchRepoNewContributors(repo),
      fetchRepoInactiveContributors(repo),
    ]);

    // Extract data from settled promises, use null for failed requests
    const openrank = openrankRes.status === 'fulfilled' ? openrankRes.value.data : null;
    const communityOpenrank = communityOpenrankRes.status === 'fulfilled' 
      ? { data: communityOpenrankRes.value.data, ...communityOpenrankRes.value.extra }
      : null;
    const attention = attentionRes.status === 'fulfilled' ? attentionRes.value.data : null;
    const participants = participantsRes.status === 'fulfilled' ? participantsRes.value.data : null;
    const newContributors = newContributorsRes.status === 'fulfilled' ? newContributorsRes.value.data : null;
    const inactiveContributors = inactiveContributorsRes.status === 'fulfilled' ? inactiveContributorsRes.value.data : null;

    return generateSuccessResponse({
      openrank,
      communityOpenrank,
      attention,
      participants,
      newContributors,
      inactiveContributors,
    });
  } catch (error) {
    console.error("Error in fetchRepoAnalysis:", error);
    // Return empty data if all requests fail
    return generateSuccessResponse({
      openrank: null,
      communityOpenrank: null,
      attention: null,
      participants: null,
      newContributors: null,
      inactiveContributors: null,
    });
  }
}

export { fetchOne, getInfo, fetchRepoAnalysis };

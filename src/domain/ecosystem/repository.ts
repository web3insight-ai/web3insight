import axios from "axios";
import { isAddress } from "viem";

import type { DataValue, ResponseResult } from "@/types";
import { getVar } from "@/utils/env";
import redis from "@/clients/redis";

import { fetchEcosystem } from "../strapi/repository";

async function fetchOne(keyword?: string): Promise<ResponseResult<Record<string, DataValue> | null>> {
  return  fetchEcosystem(keyword);
}

async function getEVMInfo(address: string) {
  const apiUrl = `${getVar("RSS3_DSL_URL")}/decentralized/${address}?limit=50&action_limit=10`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
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

  const apiUrl = `${getVar("OSSINSIGHT_URL")}/repo/${repo}`;

  try {
    const response = await axios.get(apiUrl);
    const result = response.data.data;

    await redis.set(key, JSON.stringify(result), "EX", 60 * 60 * 24 * 2);
    return result;
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

  const apiUrl = `${getVar("OSSINSIGHT_URL")}/users/${user}`;

  try {
    const response = await axios.get(apiUrl);
    const result = response.data.data;

    await redis.set(key, JSON.stringify(result), "EX", 60 * 60 * 24 * 2);
    return result;
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

export { fetchOne, getInfo };

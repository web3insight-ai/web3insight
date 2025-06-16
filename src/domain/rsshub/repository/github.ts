import type { ResponseResult } from "@/types";

import type { GithubUserActivity } from "../typing";
import httpClient from "./client";

async function fetchGithubUserActivity(username: string): Promise<ResponseResult<GithubUserActivity>> {
  try {
    return await httpClient.get(`/github/activity/${username}`, { params: { format: "json" } });
  } catch (error) {
    console.error(`[RSSHub] Request failed for ${username}:`, error);
    throw error;
  }
}

export { fetchGithubUserActivity };

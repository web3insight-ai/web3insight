import type { ResponseResult } from "@/types";

import type { GithubUserActivity } from "../typing";
import httpClient from "./client";

async function fetchGithubUserActivity(username: string): Promise<ResponseResult<GithubUserActivity>> {
  return httpClient.get(`/github/activity/${username}`, { params: { format: "json" } });
}

export { fetchGithubUserActivity };

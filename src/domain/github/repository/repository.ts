import type { ResponseResult } from "@/types";

import type { Repo } from "../typing";

import httpClient from "./client";

/**
 * Fetch GitHub repository data by full name (owner/repo)
 * Uses GitHub API via backend proxy
 */
async function fetchRepoByName(repoName: string): Promise<ResponseResult<Repo>> {
  try {
    // GitHub API endpoint for repository data
    const response = await httpClient.get(`/repos/${repoName}`);
    return response;
  } catch (error) {
    console.error(`[GitHub Repository] Error fetching repo ${repoName}:`, error);
    return {
      success: false,
      data: null as unknown as Repo,
      message: error instanceof Error ? error.message : "Unknown error occurred",
      code: "500",
    };
  }
}

export { fetchRepoByName };

import type { DataValue } from "@/types";

import { resolveDeveloperFromGithubUser } from "../developer/helper";

import type { GithubUser, EventReport } from "./typing";

// Raw event data structure from API
// Full structure: { id, description, github: { users }, data: { users, ecosystem_ranking, ... } }
interface RawEventData {
  id?: DataValue;
  intent?: DataValue;
  description?: DataValue;
  request_data?: { urls?: string[] } | string[];
  // GitHub user info at root level
  github?: {
    users?: GithubUser[];
  };
  // Analytics data nested under "data"
  data?: {
    users?: RawUserData[];
    ecosystem_ranking?: unknown[];
    contribution_percentage?: number;
    users_with_contributions?: number;
    users_without_contributions?: number;
  };
  // Legacy: users might be at root level in some responses
  users?: RawUserData[];
  created_at?: string;
  updated_at?: string;
  submitter_id?: string;
}

// Analytics user data structure
interface RawUserData {
  actor_id: string;
  user_score?: string | number;
  ecosystem_scores: RawEcosystemScore[];
}

interface RawEcosystemScore {
  ecosystem: string;
  total_score: DataValue;
  repos: RawRepoScore[];
}

interface RawRepoScore {
  repo_name?: string;
  score?: number;
  [key: string]: DataValue;
}

function resolveEventDetail(raw: Record<string, DataValue>): EventReport {
  // Type-safe access to raw data
  const rawData = raw as unknown as RawEventData;

  const ghUsers = rawData.github?.users || [];
  // Create a map that can look up users by both ID and login (actor_id could be either)
  const ghUserMap: Record<string, GithubUser> = ghUsers.reduce(
    (acc, u) => ({
      ...acc,
      [u.id]: u,
      [u.login]: u,
    }),
    {} as Record<string, GithubUser>,
  );

  // Check both possible structures: users at root level or under data.users
  const dataUsers = rawData.users || rawData.data?.users || [];
  const contestants = dataUsers.map((u) => {
    const analytics = (u.ecosystem_scores || [])
      .filter((eco) => eco.ecosystem !== "ALL")
      .map((eco) => {
        const repos = (eco.repos || []).map((repo) => {
          // Handle new API format: { repo_name: "owner/repo", score: 123, ... }
          if (repo.repo_name && repo.score !== undefined) {
            return {
              fullName: String(repo.repo_name),
              score: String(repo.score),
            };
          }

          // Fallback for old format or unexpected structures
          const entries = Object.entries(repo);
          if (entries.length === 0) {
            return { fullName: "unknown", score: "0" };
          }

          const [fullName, score] = entries[0];
          return { fullName, score: String(score) };
        });

        return {
          name: eco.ecosystem,
          score:
            typeof eco.total_score === "number"
              ? eco.total_score
              : Number(eco.total_score) || 0,
          repos,
        };
      });

    // Get user from map, with actor_id as fallback for display
    const ghUser = ghUserMap[u.actor_id];
    const developer = resolveDeveloperFromGithubUser(ghUser);

    // If no GitHub user found, use actor_id as username
    if (!ghUser && u.actor_id) {
      developer.username = u.actor_id;
      developer.nickname = u.actor_id;
    }

    return {
      ...developer,
      analytics,
    };
  });

  // Try to find request_data in different possible locations
  // API returns request_data: { urls: [...] } or request_data: [...]
  let requestData: string[] | undefined;

  if (rawData.request_data) {
    if (Array.isArray(rawData.request_data)) {
      requestData = rawData.request_data;
    } else if (
      typeof rawData.request_data === "object" &&
      "urls" in rawData.request_data
    ) {
      const reqData = rawData.request_data as { urls?: string[] };
      requestData = reqData.urls;
    }
  }

  return {
    id: String(rawData.id ?? ""),
    type: "hackathon" as const,
    description: String(rawData.description ?? ""),
    contestants,
    request_data: requestData,
  };
}

export { resolveEventDetail };

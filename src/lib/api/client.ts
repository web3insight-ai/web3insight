import { env } from "@env";
import type {
  ResponseResult,
  TotalResponse,
  ListResponse,
  EcoRankRecord,
  EcoRepo,
  RepoRankRecord,
  RepoTrendingRecord,
  RepoDeveloperActivityRecord,
  RepoActiveDeveloperRecord,
  ActorRankRecord,
  ActorTrendRecord,
  ActorCountryRankResponse,
  AdminEcosystemListResponse,
  EcoParams,
  ActorTotalParams,
  ActorTrendParams,
  PaginationParams,
  AnalysisUserListParams,
  AnalyzeUserRequest,
  AnalyzeUserResponse,
  EventInsight,
  EventInsightsParams,
  EventInsightsResponse,
  DeveloperEcosystems,
  EcoScoreApiResponse,
  EcosystemInfo,
  GitHubRepo,
  GitHubEvent,
  OssInsightUser,
  PersonalOverview,
  PersonalContributionTrend,
  Developer,
  DeveloperActivity,
  DeveloperContribution,
  DeveloperRepository,
  DonateRepo,
} from "./types";
import { isNumeric } from "@/utils";

// ============================================================================
// Core Fetch Function
// ============================================================================

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Type-safe fetch wrapper for the backend API
 * Returns ResponseResult<T> to match existing patterns
 */
async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ResponseResult<T>> {
  const { method = "GET", params, body, headers = {}, signal } = options;

  const url = new URL(path, env.DATA_API_URL);

  // Add query params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DATA_API_TOKEN}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: signal ?? AbortSignal.timeout(Number(env.HTTP_TIMEOUT)),
  });

  if (!response.ok) {
    return {
      success: false,
      data: undefined as T,
      message: `HTTP Error: ${response.status} ${response.statusText}`,
      code: String(response.status),
    };
  }

  // Handle empty responses (204 No Content or empty body)
  const text = await response.text();
  if (!text || text.trim() === "") {
    return {
      success: true,
      data: undefined as T,
      message: "No content",
      code: "204",
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      success: false,
      data: undefined as T,
      message: "Invalid JSON response from server",
      code: "500",
    };
  }

  // Normalize response to ResponseResult format
  // Backend may return { data, ... } or { success, data, ... }
  if (json && typeof json === "object" && "success" in json) {
    return json as ResponseResult<T>;
  }

  // Handle primitive responses (boolean, number, string)
  if (json === null || typeof json !== "object") {
    return {
      success: true,
      data: json as T,
      message: "Success",
      code: "200",
    };
  }

  const jsonObj = json as Record<string, unknown>;

  // Check if response looks like a complete event/analysis response
  // These have id, github, data at the top level and should NOT be unwrapped
  const isEventResponse =
    "id" in jsonObj && "github" in jsonObj && "data" in jsonObj;

  return {
    success: true,
    // For event responses, use the full object; otherwise extract data field
    data: (isEventResponse ? json : (jsonObj?.data ?? json)) as T,
    message: (jsonObj?.message as string) ?? "Success",
    code: (jsonObj?.code as string) ?? "200",
  };
}

/**
 * Create authenticated API client for user-specific requests
 */
function createAuthenticatedFetch(userToken: string) {
  return async function <T>(
    path: string,
    options: Omit<FetchOptions, "headers"> = {},
  ): Promise<ResponseResult<T>> {
    return fetchApi<T>(path, {
      ...options,
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
  };
}

// ============================================================================
// Type-Safe API Namespace
// ============================================================================

export const api = {
  // --------------------------------------------------------------------------
  // Ecosystems
  // --------------------------------------------------------------------------
  ecosystems: {
    getTotal: (): Promise<ResponseResult<TotalResponse>> =>
      fetchApi("/v1/ecosystems/total"),

    getRankList: (): Promise<ResponseResult<ListResponse<EcoRankRecord>>> =>
      fetchApi("/v1/ecosystems/top"),

    // Admin endpoints
    getAdminList: (): Promise<ResponseResult<AdminEcosystemListResponse>> =>
      fetchApi("/v1/admin/ecosystems"),

    getAdminRepoList: (
      params: PaginationParams & EcoParams = {},
    ): Promise<ResponseResult<ListResponse<EcoRepo> & TotalResponse>> => {
      const { eco, ...others } = params;
      return fetchApi("/v1/admin/ecosystems/repos", {
        params: { ...others, eco_name: eco },
      });
    },

    updateRepoCustomMark: (data: {
      id: number;
      eco: string;
      mark: number;
    }): Promise<ResponseResult<void>> => {
      const { id, eco, ...others } = data;
      return fetchApi(`/v1/admin/ecosystems/repos/${id}/mark`, {
        method: "POST",
        body: { ...others, eco_name: eco },
      });
    },
  },

  // --------------------------------------------------------------------------
  // Repositories
  // --------------------------------------------------------------------------
  repos: {
    getTotal: (
      params: EcoParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      fetchApi("/v1/repos/total", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getRankList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoRankRecord>>> =>
      fetchApi("/v1/repos/top", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getTrendingList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoTrendingRecord>>> =>
      fetchApi("/v1/repos/top/7d", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getDeveloperActivityList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoDeveloperActivityRecord>>> =>
      fetchApi("/v1/repos/top/dev/7d", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getActiveDeveloperList: (
      repoId: number,
    ): Promise<ResponseResult<ListResponse<RepoActiveDeveloperRecord>>> =>
      fetchApi("/v1/repos/active/developer", {
        params: { repo_id: repoId },
      }),
  },

  // --------------------------------------------------------------------------
  // Actors (Developers)
  // --------------------------------------------------------------------------
  actors: {
    getTotal: (
      params: ActorTotalParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      fetchApi("/v1/actors/total", {
        params: {
          eco_name: params.eco ?? "ALL",
          scope: params.scope ?? "ALL",
        },
      }),

    getGrowthCount: (
      params: EcoParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      fetchApi("/v1/actors/total/new/quarter/last", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getRankList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<ActorRankRecord>>> =>
      fetchApi("/v1/actors/top", {
        params: { eco_name: params.eco ?? "ALL" },
      }),

    getTrendList: (
      params: ActorTrendParams = {},
    ): Promise<ResponseResult<ListResponse<ActorTrendRecord>>> =>
      fetchApi("/v1/actors/total/date", {
        params: {
          eco_name: params.eco ?? "ALL",
          period: params.period ?? "month",
        },
      }),

    getCountryRank: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ActorCountryRankResponse>> =>
      fetchApi("/v1/actors/country/rank", {
        params: { eco_name: params.eco ?? "ALL" },
      }),
  },

  // --------------------------------------------------------------------------
  // Rankings (Yearly Reports)
  // --------------------------------------------------------------------------
  rankings: {
    getYearlyReport: (): Promise<ResponseResult<unknown>> =>
      fetchApi("/v1/years/rank/report"),
  },

  // --------------------------------------------------------------------------
  // Statistics (Aggregated data)
  // --------------------------------------------------------------------------
  statistics: {
    getOverview: async (): Promise<
      ResponseResult<{
        ecosystem: string | number;
        repository: string | number;
        developer: string | number;
        coreDeveloper: string | number;
      }>
    > => {
      const [ecosystemRes, repoRes, actorRes, coreActorRes] = await Promise.all(
        [
          fetchApi<TotalResponse>("/v1/ecosystems/total"),
          fetchApi<TotalResponse>("/v1/repos/total", {
            params: { eco_name: "ALL" },
          }),
          fetchApi<TotalResponse>("/v1/actors/total", {
            params: { eco_name: "ALL", scope: "ALL" },
          }),
          fetchApi<TotalResponse>("/v1/actors/total", {
            params: { eco_name: "ALL", scope: "Core" },
          }),
        ],
      );

      if (
        !ecosystemRes.success ||
        !repoRes.success ||
        !actorRes.success ||
        !coreActorRes.success
      ) {
        return {
          success: false,
          data: { ecosystem: 0, repository: 0, developer: 0, coreDeveloper: 0 },
          message: "Failed to fetch statistics overview",
          code: "500",
        };
      }

      return {
        success: true,
        data: {
          ecosystem: ecosystemRes.data.total,
          repository: repoRes.data.total,
          developer: actorRes.data.total,
          coreDeveloper: coreActorRes.data.total,
        },
        message: "Success",
        code: "200",
      };
    },
  },

  // --------------------------------------------------------------------------
  // Developers
  // --------------------------------------------------------------------------
  developers: {
    getOne: async (
      idOrUsername: number | string,
    ): Promise<ResponseResult<Developer | null>> => {
      try {
        // Fetch user from OSS Insight
        const userRes = isNumeric(idOrUsername)
          ? await api.ossinsight.getUserById(idOrUsername)
          : await api.ossinsight.getUser(String(idOrUsername));

        if (!userRes.success || !userRes.data) {
          const errorCode = userRes.message?.toLowerCase().includes("not found")
            ? "404"
            : userRes.code;
          return {
            success: false,
            data: null,
            message: userRes.message,
            code: errorCode,
          };
        }

        // Fetch personal overview stats
        const statsRes = await api.ossinsight.getPersonalOverview(
          userRes.data.id,
        );
        if (!statsRes.success) {
          return {
            success: false,
            data: null,
            message: statsRes.message,
            code: statsRes.code,
          };
        }

        const user = userRes.data;
        const stats = statsRes.data[0] || { pull_requests: 0, code_reviews: 0 };

        const developer: Developer = {
          id: user.id,
          username: user.login,
          nickname: user.name || "",
          description: user.bio || "",
          avatar: user.avatar_url,
          location: user.location || "",
          social: {
            github: user.html_url,
            twitter: user.twitter_username || "",
            website: user.blog || "",
          },
          statistics: {
            repository: user.public_repos,
            pullRequest: stats.pull_requests,
            codeReview: stats.code_reviews,
          },
          joinedAt: user.created_at,
        };

        return {
          success: true,
          data: developer,
          message: "Success",
          code: "200",
        };
      } catch (error) {
        console.error("[API] Failed to fetch developer:", error);
        return {
          success: false,
          data: null,
          message: "Failed to fetch developer",
          code: "500",
        };
      }
    },

    getRepositoryRankList: async (
      username: string,
    ): Promise<ResponseResult<DeveloperRepository[]>> => {
      try {
        const reposRes = await api.github.getUserRepos(username);
        if (!reposRes.success || !reposRes.data) {
          return {
            success: false,
            data: [],
            message: reposRes.message,
            code: reposRes.code,
          };
        }

        const repos: DeveloperRepository[] = reposRes.data
          .map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || "",
            statistics: {
              star: repo.stargazers_count,
              fork: repo.forks_count,
              watch: repo.watchers_count,
              openIssue: repo.open_issues_count,
              contributor: -1,
            },
          }))
          .sort((a, b) => (a.statistics.star >= b.statistics.star ? -1 : 1))
          .slice(0, 10);

        return { success: true, data: repos, message: "Success", code: "200" };
      } catch (error) {
        console.error("[API] Failed to fetch developer repos:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch repos",
          code: "500",
        };
      }
    },

    getActivityList: async (
      username: string,
    ): Promise<ResponseResult<DeveloperActivity[]>> => {
      try {
        const eventsRes = await api.github.getUserEvents(username);
        if (!eventsRes.success || !eventsRes.data) {
          return {
            success: false,
            data: [],
            message: eventsRes.message,
            code: eventsRes.code,
          };
        }

        // Transform events to activities with description
        const activities: DeveloperActivity[] = eventsRes.data.map((event) => {
          let description = `Performed ${event.type} in ${event.repo.name}`;

          // Create descriptions based on event type
          if (event.type === "PushEvent") {
            const ref =
              (event.payload as { ref?: string }).ref?.replace(
                "refs/heads/",
                "",
              ) || "main";
            description = `pushed to ${ref} in ${event.repo.name}`;
          } else if (event.type === "CreateEvent") {
            const payload = event.payload as {
              ref_type?: string;
              ref?: string;
            };
            description = `created a ${payload.ref_type || "branch"} ${payload.ref || ""} in ${event.repo.name}`;
          } else if (event.type === "DeleteEvent") {
            const payload = event.payload as {
              ref_type?: string;
              ref?: string;
            };
            description = `deleted ${payload.ref_type || "branch"} ${payload.ref || ""} at ${event.repo.name}`;
          } else if (event.type === "IssuesEvent") {
            const action =
              (event.payload as { action?: string }).action || "opened";
            description = `${action} an issue in ${event.repo.name}`;
          } else if (event.type === "IssueCommentEvent") {
            const issue = (event.payload as { issue?: { number?: number } })
              .issue;
            description = `commented on issue ${event.repo.name}#${issue?.number || ""}`;
          } else if (event.type === "PullRequestEvent") {
            const payload = event.payload as {
              action?: string;
              pull_request?: { merged?: boolean };
            };
            const action =
              payload.action === "closed" && payload.pull_request?.merged
                ? "merged"
                : payload.action;
            description = `${action} a pull request in ${event.repo.name}`;
          } else if (event.type === "PullRequestReviewEvent") {
            description = `reviewed a pull request in ${event.repo.name}`;
          } else if (event.type === "PullRequestReviewCommentEvent") {
            const pr = (event.payload as { pull_request?: { number?: number } })
              .pull_request;
            description = `commented on pull request ${event.repo.name}#${pr?.number || ""}`;
          }

          return {
            id: event.id,
            description,
            date: event.created_at,
          };
        });

        return {
          success: true,
          data: activities,
          message: "Success",
          code: "200",
        };
      } catch (error) {
        console.error("[API] Failed to fetch developer activities:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch activities",
          code: "500",
        };
      }
    },

    getContributionList: async (
      userId: number,
    ): Promise<ResponseResult<DeveloperContribution[]>> => {
      try {
        const trendsRes = await api.ossinsight.getContributionTrends(userId);
        if (!trendsRes.success || !trendsRes.data) {
          return {
            success: false,
            data: [],
            message: trendsRes.message,
            code: trendsRes.code,
          };
        }

        const contributions: DeveloperContribution[] = trendsRes.data
          .filter((item) => item.contribution_type === "pushes")
          .map((item) => ({ date: item.event_month, total: item.cnt }))
          .slice(-10)
          .reverse();

        return {
          success: true,
          data: contributions,
          message: "Success",
          code: "200",
        };
      } catch (error) {
        console.error("[API] Failed to fetch developer contributions:", error);
        return {
          success: false,
          data: [],
          message: "Failed to fetch contributions",
          code: "500",
        };
      }
    },

    getEcosystems: async (
      id: number,
    ): Promise<ResponseResult<DeveloperEcosystems | null>> => {
      try {
        const result = await fetchApi<EcoScoreApiResponse>(
          `/v2/external/github/users/id/${id}`,
        );

        if (!result.success || !result.data) {
          return {
            success: false,
            message: result.message || "Failed to fetch ecosystems",
            data: null,
            code: result.code || "500",
          };
        }

        const ecoScore = result.data.eco_score;
        if (
          !ecoScore ||
          !ecoScore.ecosystems ||
          ecoScore.ecosystems.length === 0
        ) {
          return {
            success: true,
            data: { ecosystems: [], totalScore: 0 },
            message: "Success",
            code: "200",
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
          message: "Success",
          code: "200",
        };
      } catch (error) {
        console.error("[API] Failed to fetch developer ecosystems:", error);
        return {
          success: false,
          message: "Failed to fetch ecosystems",
          data: null,
          code: "500",
        };
      }
    },
  },

  // --------------------------------------------------------------------------
  // Events (Public)
  // --------------------------------------------------------------------------
  events: {
    getPublicList: (
      params: EventInsightsParams = {},
    ): Promise<ResponseResult<EventInsight[]>> =>
      fetchApi<EventInsightsResponse>("/v1/custom/analysis/users/public", {
        params: {
          skip: params.skip ?? 0,
          take: params.take ?? 10,
          intent: params.intent ?? "hackathon",
          direction: params.direction ?? "asc",
        },
      }).then((res) => ({
        ...res,
        data: res.success ? res.data.list : [],
        extra: res.success ? { total: res.data.total } : undefined,
      })),

    getPublicDetail: (id: number | string): Promise<ResponseResult<unknown>> =>
      fetchApi(`/v1/custom/analysis/users/${id}`),

    // Get event-specific developer profile by username or GitHub ID
    getEventDeveloper: (identifier: string): Promise<ResponseResult<unknown>> =>
      fetchApi(`/v1/event/users/${identifier}`),
  },

  // --------------------------------------------------------------------------
  // Custom Analysis (requires user token)
  // --------------------------------------------------------------------------
  custom: {
    getAnalysisUserList: (
      userToken: string,
      params: AnalysisUserListParams = {},
    ): Promise<ResponseResult<ListResponse<unknown> & TotalResponse>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      const queryParams: Record<string, string | number | undefined> = {
        offset: params.offset,
        limit: params.limit,
        search: params.search,
        order: params.order,
        direction: params.direction,
      };
      return authFetch("/v1/custom/analysis/users", { params: queryParams });
    },

    analyzeUserList: (
      userToken: string,
      data: AnalyzeUserRequest,
    ): Promise<ResponseResult<AnalyzeUserResponse>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      return authFetch("/v1/custom/analysis/users", {
        method: "POST",
        body: data,
      });
    },

    getAnalysisUser: (
      userToken: string,
      id: number,
    ): Promise<ResponseResult<unknown>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      return authFetch(`/v1/custom/analysis/users/${id}`);
    },

    updateAnalysisUser: (
      userToken: string,
      id: number,
      data: AnalyzeUserRequest,
    ): Promise<ResponseResult<AnalyzeUserResponse>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      return authFetch(`/v1/custom/analysis/users/${id}`, {
        method: "POST",
        body: data,
      });
    },
  },

  // --------------------------------------------------------------------------
  // GitHub Proxy (via backend)
  // --------------------------------------------------------------------------
  github: {
    getRepoByName: (repoName: string): Promise<ResponseResult<GitHubRepo>> =>
      fetchApi(`/v1/github/proxy/repos/${repoName}`),

    getUserRepos: (login: string): Promise<ResponseResult<GitHubRepo[]>> =>
      fetchApi(`/v1/github/proxy/users/${login}/repos`),

    getUserEvents: (login: string): Promise<ResponseResult<GitHubEvent[]>> =>
      fetchApi(`/v1/github/proxy/users/${login}/events/public`, {
        params: { per_page: 20 },
      }),
  },

  // --------------------------------------------------------------------------
  // x402 Donate
  // --------------------------------------------------------------------------
  donate: {
    list: (): Promise<ResponseResult<DonateRepo[]>> =>
      fetchApi("/v1/donate/repos"),

    getById: (id: number): Promise<ResponseResult<DonateRepo>> =>
      fetchApi(`/v1/donate/repos/${id}`),

    getByName: (name: string): Promise<ResponseResult<DonateRepo>> =>
      fetchApi(`/v1/donate/repos/name/${encodeURIComponent(name)}`),

    submit: (
      userToken: string,
      repoFullName: string,
    ): Promise<ResponseResult<DonateRepo>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      return authFetch("/v1/donate/repos", {
        method: "POST",
        body: { repo_full_name: repoFullName },
      });
    },

    update: (
      userToken: string,
      id: number,
      repoDonateData: Record<string, unknown>,
    ): Promise<ResponseResult<DonateRepo>> => {
      const authFetch = createAuthenticatedFetch(userToken);
      return authFetch(`/v1/donate/repos/${id}`, {
        method: "POST",
        body: { repo_donate_data: repoDonateData },
      });
    },
  },

  // --------------------------------------------------------------------------
  // OSS Insight (external API)
  // --------------------------------------------------------------------------
  ossinsight: {
    getUser: async (login: string): Promise<ResponseResult<OssInsightUser>> => {
      try {
        const response = await fetch(
          `${env.OSSINSIGHT_URL}/gh/users/${login}`,
          {
            signal: AbortSignal.timeout(env.HTTP_TIMEOUT),
          },
        );
        if (!response.ok) {
          return {
            success: false,
            data: null as unknown as OssInsightUser,
            message: `HTTP Error: ${response.status}`,
            code: String(response.status),
          };
        }
        const json = await response.json();
        if (json && json.data) {
          return {
            success: true,
            data: json.data,
            message: "Success",
            code: "200",
          };
        }
        return {
          success: false,
          data: null as unknown as OssInsightUser,
          message: "No data",
          code: "404",
        };
      } catch (error) {
        return {
          success: false,
          data: null as unknown as OssInsightUser,
          message: error instanceof Error ? error.message : "Unknown error",
          code: "500",
        };
      }
    },

    getUserById: async (
      id: number | string,
    ): Promise<ResponseResult<OssInsightUser>> => {
      try {
        const response = await fetch(`${env.OSSINSIGHT_URL}/gh/user/${id}`, {
          signal: AbortSignal.timeout(env.HTTP_TIMEOUT),
        });
        if (!response.ok) {
          return {
            success: false,
            data: null as unknown as OssInsightUser,
            message: `HTTP Error: ${response.status}`,
            code: String(response.status),
          };
        }
        const json = await response.json();
        if (json && json.data) {
          return {
            success: true,
            data: json.data,
            message: "Success",
            code: "200",
          };
        }
        return {
          success: false,
          data: null as unknown as OssInsightUser,
          message: "No data",
          code: "404",
        };
      } catch (error) {
        return {
          success: false,
          data: null as unknown as OssInsightUser,
          message: error instanceof Error ? error.message : "Unknown error",
          code: "500",
        };
      }
    },

    getPersonalOverview: async (
      userId: number,
    ): Promise<ResponseResult<PersonalOverview[]>> => {
      try {
        const response = await fetch(
          `${env.OSSINSIGHT_URL}/q/personal-overview?userId=${userId}`,
          { signal: AbortSignal.timeout(env.HTTP_TIMEOUT) },
        );
        if (!response.ok) {
          return {
            success: false,
            data: [],
            message: `HTTP Error: ${response.status}`,
            code: String(response.status),
          };
        }
        const json = await response.json();
        if (json && json.data) {
          return {
            success: true,
            data: json.data,
            message: "Success",
            code: "200",
          };
        }
        return { success: false, data: [], message: "No data", code: "404" };
      } catch (error) {
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Unknown error",
          code: "500",
        };
      }
    },

    getContributionTrends: async (
      userId: number,
    ): Promise<ResponseResult<PersonalContributionTrend[]>> => {
      try {
        const response = await fetch(
          `${env.OSSINSIGHT_URL}/q/personal-contribution-trends?userId=${userId}`,
          { signal: AbortSignal.timeout(env.HTTP_TIMEOUT) },
        );
        if (!response.ok) {
          return {
            success: false,
            data: [],
            message: `HTTP Error: ${response.status}`,
            code: String(response.status),
          };
        }
        const json = await response.json();
        if (json && json.data) {
          return {
            success: true,
            data: json.data,
            message: "Success",
            code: "200",
          };
        }
        return { success: false, data: [], message: "No data", code: "404" };
      } catch (error) {
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Unknown error",
          code: "500",
        };
      }
    },
  },
};

// Export utility for direct fetch access
export { fetchApi, createAuthenticatedFetch };

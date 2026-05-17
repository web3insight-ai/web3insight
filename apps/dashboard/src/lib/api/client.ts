import { env } from "@env";
import { createWeb3InsightClient } from "@web3insight/orpc-client";
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
  YearlyReportData,
} from "./types";
import { isNumeric } from "@/utils";

// ============================================================================
// oRPC clients (one for the service token, factory for per-user tokens)
// ============================================================================

// Reason: Universal client (works in both server and client components) that
// auths with the build-time DATA_API_TOKEN. Replaces the legacy fetchApi REST
// shim — every method below now speaks oRPC over /rpc/* via the typed
// @web3insight/api-contract.
const { client: serviceClient } = createWeb3InsightClient({
  url: `${env.DATA_API_URL}/rpc`,
  token: env.DATA_API_TOKEN,
  // Reason: server-to-server call — don't forward browser cookies, we attach
  // the bearer token ourselves.
  credentials: "omit",
  timeoutMs: Number(env.HTTP_TIMEOUT),
});

function clientForUser(token: string) {
  return createWeb3InsightClient({
    url: `${env.DATA_API_URL}/rpc`,
    token,
    credentials: "omit",
    timeoutMs: Number(env.HTTP_TIMEOUT),
  }).client;
}

/**
 * Wrap an oRPC call in the legacy ResponseResult<T> envelope the dashboard UI
 * consumes everywhere. ORPCError.status → string code; plain errors get 500.
 */
async function rpc<T>(
  fn: () => Promise<unknown>,
  fallback: T,
): Promise<ResponseResult<T>> {
  try {
    const data = (await fn()) as T;
    return { success: true, data, message: "Success", code: "200" };
  } catch (error) {
    // Reason: orpc-client throws an ORPCError with `.status` (HTTP int) +
    // `.message`; detect by shape rather than importing the class so we don't
    // need to pull @orpc/client as a direct dep.
    const errObj = error as { status?: number; message?: string } | null;
    const status = errObj?.status ? String(errObj.status) : "500";
    const message =
      error instanceof Error ? error.message : "Request failed";
    return { success: false, data: fallback, message, code: status };
  }
}

// ============================================================================
// Type-Safe API Namespace (unchanged surface, oRPC internals)
// ============================================================================

export const api = {
  // --------------------------------------------------------------------------
  // Ecosystems
  // --------------------------------------------------------------------------
  ecosystems: {
    getTotal: (): Promise<ResponseResult<TotalResponse>> =>
      rpc(
        () => serviceClient.total.ecosystems({}),
        { total: 0 } as unknown as TotalResponse,
      ),

    getRankList: (): Promise<ResponseResult<ListResponse<EcoRankRecord>>> =>
      rpc(
        () => serviceClient.rank.ecosystemsTop({}),
        { list: [] } as ListResponse<EcoRankRecord>,
      ),

    getAdminList: (): Promise<ResponseResult<AdminEcosystemListResponse>> =>
      rpc(
        () => serviceClient.admin.listEcosystems({}),
        {} as AdminEcosystemListResponse,
      ),

    getAdminRepoList: (
      params: PaginationParams & EcoParams = {},
    ): Promise<ResponseResult<ListResponse<EcoRepo> & TotalResponse>> => {
      const { eco, ...others } = params;
      return rpc(
        () =>
          serviceClient.admin.listEcosystemRepos({
            ...(others as Record<string, unknown>),
            eco_name: eco,
          } as never),
        { list: [], total: 0 } as unknown as ListResponse<EcoRepo> & TotalResponse,
      );
    },

    updateRepoCustomMark: (data: {
      id: number;
      eco: string;
      mark: number;
    }): Promise<ResponseResult<void>> => {
      const { id, eco, mark } = data;
      return rpc(
        () =>
          serviceClient.admin.markEcosystemRepo({
            id,
            eco_name: eco,
            mark,
          } as never),
        undefined as unknown as void,
      );
    },
  },

  // --------------------------------------------------------------------------
  // Repositories
  // --------------------------------------------------------------------------
  repos: {
    getTotal: (
      params: EcoParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      rpc(
        () => serviceClient.total.repos({ eco_name: params.eco ?? "ALL" }),
        { total: 0 } as unknown as TotalResponse,
      ),

    getRankList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoRankRecord>>> =>
      rpc(
        () =>
          serviceClient.rank.reposTop({ eco_name: params.eco ?? "ALL" } as never),
        { list: [] } as ListResponse<RepoRankRecord>,
      ),

    getTrendingList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoTrendingRecord>>> =>
      rpc(
        () =>
          serviceClient.rank.reposTop7d({
            eco_name: params.eco ?? "ALL",
          } as never),
        { list: [] } as ListResponse<RepoTrendingRecord>,
      ),

    getDeveloperActivityList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<RepoDeveloperActivityRecord>>> =>
      rpc(
        () =>
          serviceClient.rank.reposTopByDev7d({
            eco_name: params.eco ?? "ALL",
          } as never),
        { list: [] } as ListResponse<RepoDeveloperActivityRecord>,
      ),

    getActiveDeveloperList: (
      repoId: number,
    ): Promise<ResponseResult<ListResponse<RepoActiveDeveloperRecord>>> =>
      rpc(
        () =>
          serviceClient.repo.activeDeveloper({ repo_id: repoId } as never),
        { list: [] } as ListResponse<RepoActiveDeveloperRecord>,
      ),
  },

  // --------------------------------------------------------------------------
  // Actors (Developers)
  // --------------------------------------------------------------------------
  actors: {
    getTotal: (
      params: ActorTotalParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      rpc(
        () =>
          serviceClient.total.actors({
            eco_name: params.eco ?? "ALL",
            scope: params.scope ?? "ALL",
          } as never),
        { total: 0 } as unknown as TotalResponse,
      ),

    getGrowthCount: (
      params: EcoParams = {},
    ): Promise<ResponseResult<TotalResponse>> =>
      rpc(
        () =>
          serviceClient.total.actorsLastQuarterNew({
            eco_name: params.eco ?? "ALL",
          } as never),
        { total: 0 } as unknown as TotalResponse,
      ),

    getRankList: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ListResponse<ActorRankRecord>>> =>
      rpc(
        () =>
          serviceClient.rank.actorsTop({
            eco_name: params.eco ?? "ALL",
          } as never),
        { list: [] } as ListResponse<ActorRankRecord>,
      ),

    getTrendList: (
      params: ActorTrendParams = {},
    ): Promise<ResponseResult<ListResponse<ActorTrendRecord>>> =>
      rpc(
        () =>
          serviceClient.total.actorsByDate({
            eco_name: params.eco ?? "ALL",
            period: params.period ?? "month",
          } as never),
        { list: [] } as ListResponse<ActorTrendRecord>,
      ),

    getCountryRank: (
      params: EcoParams = {},
    ): Promise<ResponseResult<ActorCountryRankResponse>> =>
      rpc(
        () =>
          serviceClient.total.actorsByCountry({
            eco_name: params.eco ?? "ALL",
          } as never),
        { list: [], total: 0 } as ActorCountryRankResponse,
      ),
  },

  // --------------------------------------------------------------------------
  // Rankings (Yearly Reports)
  // --------------------------------------------------------------------------
  rankings: {
    getYearlyReport: (): Promise<ResponseResult<YearlyReportData>> =>
      rpc(
        () => serviceClient.rank.yearsRankReport({}),
        {} as YearlyReportData,
      ),
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
          api.ecosystems.getTotal(),
          api.repos.getTotal({ eco: "ALL" }),
          api.actors.getTotal({ eco: "ALL", scope: "ALL" }),
          api.actors.getTotal({ eco: "ALL", scope: "Core" }),
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

        const activities: DeveloperActivity[] = eventsRes.data.map((event) => {
          let description = `Performed ${event.type} in ${event.repo.name}`;

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
      const result = await rpc<EcoScoreApiResponse | null>(
        () => serviceClient.custom.externalGithubById({ id: String(id) }),
        null,
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
        data: { ecosystems, totalScore: ecoScore.total_score },
        message: "Success",
        code: "200",
      };
    },
  },

  // --------------------------------------------------------------------------
  // Events (Public)
  // --------------------------------------------------------------------------
  events: {
    getPublicList: async (
      params: EventInsightsParams = {},
    ): Promise<ResponseResult<EventInsight[]>> => {
      const res = await rpc<EventInsightsResponse>(
        () =>
          serviceClient.custom.listPublicAnalyses({
            skip: params.skip ?? 0,
            take: params.take ?? 10,
            intent: (params.intent ?? "hackathon") as never,
            direction: (params.direction ?? "asc") as never,
          } as never),
        { list: [], total: 0 } as EventInsightsResponse,
      );
      return {
        ...res,
        data: res.success ? res.data.list : [],
        // Reason: legacy callsites read `extra.total` for pagination — keep it
        // available even though it's not declared on ResponseResult<T>.
        ...(res.success ? { extra: { total: res.data.total } } : {}),
      };
    },

    getPublicDetail: (id: number | string): Promise<ResponseResult<unknown>> =>
      rpc(
        () => serviceClient.custom.getAnalysis({ id: Number(id) }),
        null,
      ),

    getEventDeveloper: (identifier: string): Promise<ResponseResult<unknown>> =>
      rpc(
        () => serviceClient.custom.eventUsers({ x: identifier } as never),
        null,
      ),
  },

  // --------------------------------------------------------------------------
  // Custom Analysis (requires user token)
  // --------------------------------------------------------------------------
  custom: {
    getAnalysisUserList: (
      userToken: string,
      params: AnalysisUserListParams = {},
    ): Promise<ResponseResult<ListResponse<unknown> & TotalResponse>> => {
      const c = clientForUser(userToken);
      return rpc(
        () => c.custom.listMyAnalyses(params as never),
        { list: [], total: 0 } as unknown as ListResponse<unknown> & TotalResponse,
      );
    },

    analyzeUserList: (
      userToken: string,
      data: AnalyzeUserRequest,
    ): Promise<ResponseResult<AnalyzeUserResponse>> => {
      const c = clientForUser(userToken);
      return rpc(
        () => c.custom.createAnalysis(data as never),
        {} as AnalyzeUserResponse,
      );
    },

    getAnalysisUser: (
      userToken: string,
      id: number,
    ): Promise<ResponseResult<unknown>> => {
      const c = clientForUser(userToken);
      return rpc(() => c.custom.getAnalysis({ id }), null);
    },

    updateAnalysisUser: (
      userToken: string,
      id: number,
      data: AnalyzeUserRequest,
    ): Promise<ResponseResult<AnalyzeUserResponse>> => {
      const c = clientForUser(userToken);
      return rpc(
        () => c.custom.updateAnalysis({ id, ...(data as object) } as never),
        {} as AnalyzeUserResponse,
      );
    },
  },

  // --------------------------------------------------------------------------
  // GitHub Proxy (via backend)
  // --------------------------------------------------------------------------
  github: {
    getRepoByName: (repoName: string): Promise<ResponseResult<GitHubRepo>> =>
      rpc(
        () => serviceClient.github.proxy({ path: `repos/${repoName}` }),
        {} as GitHubRepo,
      ),

    getUserRepos: (login: string): Promise<ResponseResult<GitHubRepo[]>> =>
      rpc(
        async () =>
          (await serviceClient.github.proxy({
            path: `users/${login}/repos`,
          })) as unknown as GitHubRepo[],
        [] as GitHubRepo[],
      ),

    getUserEvents: (login: string): Promise<ResponseResult<GitHubEvent[]>> =>
      rpc(
        async () =>
          (await serviceClient.github.proxy({
            path: `users/${login}/events/public`,
            query: { per_page: 20 },
          })) as unknown as GitHubEvent[],
        [] as GitHubEvent[],
      ),
  },

  // --------------------------------------------------------------------------
  // x402 Donate
  // --------------------------------------------------------------------------
  donate: {
    list: (): Promise<ResponseResult<DonateRepo[]>> =>
      rpc(
        async () =>
          (await serviceClient.donate.listDonations({})) as unknown as DonateRepo[],
        [] as DonateRepo[],
      ),

    getById: (id: number): Promise<ResponseResult<DonateRepo>> =>
      rpc(
        () => serviceClient.donate.getDonationById({ id }),
        {} as DonateRepo,
      ),

    getByName: (name: string): Promise<ResponseResult<DonateRepo>> =>
      rpc(
        () => serviceClient.donate.getDonationByName({ name }),
        {} as DonateRepo,
      ),

    submit: (
      userToken: string,
      repoFullName: string,
    ): Promise<ResponseResult<DonateRepo>> => {
      const c = clientForUser(userToken);
      return rpc(
        () =>
          c.donate.createDonation({
            repo_full_name: repoFullName,
          } as never),
        {} as DonateRepo,
      );
    },

    update: (
      userToken: string,
      id: number,
      repoDonateData: Record<string, unknown>,
    ): Promise<ResponseResult<DonateRepo>> => {
      const c = clientForUser(userToken);
      return rpc(
        () =>
          c.donate.updateDonation({
            id,
            repo_donate_data: repoDonateData,
          } as never),
        {} as DonateRepo,
      );
    },
  },

  // --------------------------------------------------------------------------
  // OSS Insight (external API — stays raw fetch, not in our contract)
  // --------------------------------------------------------------------------
  ossinsight: {
    getUser: async (login: string): Promise<ResponseResult<OssInsightUser>> => {
      try {
        const response = await fetch(
          `${env.OSSINSIGHT_URL}/gh/users/${login}`,
          { signal: AbortSignal.timeout(env.HTTP_TIMEOUT) },
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

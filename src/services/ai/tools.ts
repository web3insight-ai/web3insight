import { tool } from "ai";
import { z } from "zod";
import { api } from "@/lib/api/client";

// ============================================================================
// Schema Definitions
// ============================================================================

const ecosystemSchema = z
  .enum(["NEAR", "OpenBuild", "Starknet", "Solana", "Ethereum", "ALL"])
  .describe(
    "The ecosystem name. Use 'ALL' for global statistics across all ecosystems.",
  );

const scopeSchema = z
  .enum(["Core", "ALL"])
  .describe(
    "Scope of contributors: 'Core' for core developers, 'ALL' for all contributors.",
  );

const periodSchema = z
  .enum(["week", "month"])
  .describe("Time period for historical data.");

// ============================================================================
// Web3 Insight Tools
// ============================================================================

export const web3InsightTools = {
  // --------------------------------------------------------------------------
  // Platform Overview & Statistics
  // --------------------------------------------------------------------------

  getPlatformOverview: tool({
    description:
      "Get a quick overview of the entire Web3Insight platform statistics including total ecosystems, repositories, developers, and core developers.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await api.statistics.getOverview();
      if (!result.success) {
        return { error: result.message };
      }
      return {
        totalEcosystems: result.data.ecosystem,
        totalRepositories: result.data.repository,
        totalDevelopers: result.data.developer,
        totalCoreDevelopers: result.data.coreDeveloper,
      };
    },
  }),

  countRepositories: tool({
    description:
      "Get the total number of repositories in a specific Web3 ecosystem or globally.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.repos.getTotal({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      return {
        ecosystem,
        totalRepositories: result.data.total,
      };
    },
  }),

  countContributors: tool({
    description:
      "Get the total number of contributors (developers) in a Web3 ecosystem. Can filter by core developers or all contributors.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
      scope: scopeSchema.default("ALL"),
    }),
    execute: async ({ ecosystem, scope }) => {
      const result = await api.actors.getTotal({ eco: ecosystem, scope });
      if (!result.success) {
        return { error: result.message };
      }
      return {
        ecosystem,
        scope,
        totalContributors: result.data.total,
      };
    },
  }),

  countEcosystems: tool({
    description:
      "Get the total number of Web3 ecosystems tracked by the platform.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await api.ecosystems.getTotal();
      if (!result.success) {
        return { error: result.message };
      }
      return {
        totalEcosystems: result.data.total,
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Ecosystem Rankings & Trends
  // --------------------------------------------------------------------------

  rankEcosystems: tool({
    description:
      "Get the ranking of top Web3 ecosystems by developer activity and repository count.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await api.ecosystems.getRankList();
      if (!result.success) {
        return { error: result.message };
      }
      const topEcosystems = result.data.list.slice(0, 10);
      return {
        topEcosystems: topEcosystems.map((eco, index) => ({
          rank: index + 1,
          name: eco.eco_name,
          repositoryCount: eco.repos_total,
          developerCount: eco.actors_total,
          coreDeveloperCount: eco.actors_core_total,
          newDevelopers: eco.actors_new_total,
        })),
      };
    },
  }),

  getRecentContributorTrends: tool({
    description:
      "Get historical contributor trends for a Web3 ecosystem over time (weekly or monthly data).",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
      period: periodSchema.default("month"),
    }),
    execute: async ({ ecosystem, period }) => {
      const result = await api.actors.getTrendList({ eco: ecosystem, period });
      if (!result.success) {
        return { error: result.message };
      }
      const trends = result.data.list.slice(-6);
      return {
        ecosystem,
        period,
        trends: trends.map((t) => ({
          date: t.date,
          total: t.total,
        })),
      };
    },
  }),

  getContributorGrowth: tool({
    description:
      "Get the number of new contributors that joined in the last quarter for an ecosystem.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.actors.getGrowthCount({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      return {
        ecosystem,
        newContributorsLastQuarter: result.data.total,
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Repository Rankings
  // --------------------------------------------------------------------------

  rankRepositories: tool({
    description:
      "Get the top repositories in a specific Web3 ecosystem ranked by star count and developer activity.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.repos.getRankList({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      const topRepos = result.data.list.slice(0, 10);
      return {
        ecosystem,
        topRepositories: topRepos.map((repo, index) => ({
          rank: index + 1,
          name: repo.repo_name,
          contributorCount: repo.contributor_count,
          starCount: repo.star_count,
          forksCount: repo.forks_count,
        })),
      };
    },
  }),

  getTrendingRepositories: tool({
    description:
      "Get the top trending repositories in the last 7 days ranked by star growth. Shows which repos are gaining the most stars recently.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.repos.getTrendingList({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      const trendingRepos = result.data.list.slice(0, 10);
      return {
        ecosystem,
        period: "7 days",
        trendingRepositories: trendingRepos.map((repo, index) => ({
          rank: index + 1,
          name: repo.repo_name,
          starGrowth7d: repo.star_growth_7d,
          totalStars: repo.star_count,
          description: repo.description || "No description",
        })),
      };
    },
  }),

  getHotRepositories: tool({
    description:
      "Get the hottest repositories by developer activity in the last 7 days. Shows which repos have the most active developers recently.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.repos.getDeveloperActivityList({
        eco: ecosystem,
      });
      if (!result.success) {
        return { error: result.message };
      }
      const hotRepos = result.data.list.slice(0, 10);
      return {
        ecosystem,
        period: "7 days",
        hotRepositories: hotRepos.map((repo, index) => ({
          rank: index + 1,
          name: repo.repo_name,
          activeDevelopers7d: repo.dev_7_day,
          totalStars: repo.star_count,
          description: repo.description || "No description",
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Developer Rankings
  // --------------------------------------------------------------------------

  rankContributors: tool({
    description:
      "Get the top contributors (developers) in a specific Web3 ecosystem ranked by commit activity.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.actors.getRankList({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      const topContributors = result.data.list.slice(0, 10);
      return {
        ecosystem,
        topContributors: topContributors.map((actor, index) => ({
          rank: index + 1,
          username: actor.actor_login,
          totalCommits: actor.total_commit_count,
          topRepos: actor.top_repos?.slice(0, 3).map((r) => r.repo_name) || [],
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Geographic Distribution
  // --------------------------------------------------------------------------

  getCountryDistribution: tool({
    description:
      "Get the geographic distribution of contributors by country for an ecosystem. Shows where developers are located globally.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.actors.getCountryRank({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      const topCountries = result.data.list.slice(0, 15);
      return {
        ecosystem,
        totalContributors: result.data.total,
        topCountries: topCountries.map((c, index) => ({
          rank: index + 1,
          country: c.country,
          developerCount: c.total,
          percentage: ((c.total / result.data.total) * 100).toFixed(1),
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Developer Profile & Details
  // --------------------------------------------------------------------------

  getDeveloperProfile: tool({
    description:
      "Get detailed profile information for a specific GitHub developer including their bio, location, and contribution statistics.",
    inputSchema: z.object({
      username: z
        .string()
        .describe("GitHub username of the developer to look up"),
    }),
    execute: async ({ username }) => {
      const result = await api.developers.getOne(username);
      if (!result.success || !result.data) {
        return { error: result.message || "Developer not found" };
      }
      const dev = result.data;
      return {
        username: dev.username,
        name: dev.nickname || dev.username,
        bio: dev.description || "No bio available",
        location: dev.location || "Unknown",
        avatar: dev.avatar,
        statistics: {
          repositories: dev.statistics.repository,
          pullRequests: dev.statistics.pullRequest,
          codeReviews: dev.statistics.codeReview,
        },
        social: {
          github: dev.social.github,
          twitter: dev.social.twitter || null,
          website: dev.social.website || null,
        },
        joinedGitHub: dev.joinedAt,
      };
    },
  }),

  getDeveloperTopRepositories: tool({
    description:
      "Get the top repositories owned or contributed to by a specific developer, ranked by stars.",
    inputSchema: z.object({
      username: z.string().describe("GitHub username of the developer"),
    }),
    execute: async ({ username }) => {
      const result = await api.developers.getRepositoryRankList(username);
      if (!result.success) {
        return { error: result.message };
      }
      return {
        username,
        topRepositories: result.data.slice(0, 8).map((repo, index) => ({
          rank: index + 1,
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description || "No description",
          stars: repo.statistics.star,
          forks: repo.statistics.fork,
        })),
      };
    },
  }),

  getDeveloperRecentActivity: tool({
    description:
      "Get the recent GitHub activity for a specific developer including pushes, PRs, issues, and code reviews.",
    inputSchema: z.object({
      username: z.string().describe("GitHub username of the developer"),
    }),
    execute: async ({ username }) => {
      const result = await api.developers.getActivityList(username);
      if (!result.success) {
        return { error: result.message };
      }
      return {
        username,
        recentActivities: result.data.slice(0, 10).map((activity) => ({
          description: activity.description,
          date: activity.date,
        })),
      };
    },
  }),

  getDeveloperEcosystems: tool({
    description:
      "Get the Web3 ecosystems a specific developer contributes to, along with their activity scores in each ecosystem.",
    inputSchema: z.object({
      username: z.string().describe("GitHub username of the developer"),
    }),
    execute: async ({ username }) => {
      // First get the user ID
      const userResult = await api.ossinsight.getUser(username);
      if (!userResult.success || !userResult.data) {
        return { error: "Developer not found" };
      }

      const result = await api.developers.getEcosystems(userResult.data.id);
      if (!result.success || !result.data) {
        return { error: result.message || "No ecosystem data found" };
      }

      return {
        username,
        totalWeb3Score: result.data.totalScore || 0,
        ecosystems: result.data.ecosystems.map((eco) => ({
          name: eco.ecosystem,
          score: eco.totalScore || 0,
          repositoryCount: eco.repoCount,
          firstActivity: eco.firstActivityAt || "Unknown",
          lastActivity: eco.lastActivityAt || "Unknown",
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Reports & Insights
  // --------------------------------------------------------------------------

  getYearlyReport: tool({
    description:
      "Get the annual Web3 developer ecosystem report with rankings, trends, and insights from the past year.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await api.rankings.getYearlyReport();
      if (!result.success) {
        return { error: result.message };
      }
      // Return the raw report data - it contains comprehensive yearly statistics
      return {
        report: result.data,
        note: "This is the comprehensive yearly Web3 developer ecosystem report",
      };
    },
  }),

  getPublicEventInsights: tool({
    description:
      "Get public hackathon and event analysis insights. Shows developer profiles analyzed for various Web3 events.",
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(20)
        .default(10)
        .describe("Number of results to return"),
    }),
    execute: async ({ limit }) => {
      const result = await api.events.getPublicList({
        take: limit,
        intent: "hackathon",
      });
      if (!result.success) {
        return { error: result.message };
      }
      const extra = result.extra as { total?: number } | undefined;
      return {
        totalEvents: extra?.total || result.data.length,
        events: result.data.map((event) => ({
          id: event.id,
          description: event.description,
          createdAt: event.created_at,
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Open Source Donations (x402)
  // --------------------------------------------------------------------------

  getDonationRepositories: tool({
    description:
      "Get the list of open source repositories that accept donations through the x402 protocol. Shows projects you can support.",
    inputSchema: z.object({}),
    execute: async () => {
      const result = await api.donate.list();
      if (!result.success) {
        return { error: result.message };
      }
      return {
        totalRepositories: result.data.length,
        repositories: result.data.slice(0, 10).map((repo) => ({
          name: repo.repo_info.full_name,
          description: repo.repo_info.description || "No description",
          stars: repo.repo_info.stargazers_count,
          donationTitle: repo.repo_donate_data?.title || "Support this project",
          donationNetwork: repo.repo_donate_data?.network || "Unknown",
          url: repo.repo_info.html_url,
        })),
      };
    },
  }),

  getDonationRepositoryByName: tool({
    description:
      "Look up a specific donation-enabled repository by its full name (owner/repo). Get detailed donation info for a project.",
    inputSchema: z.object({
      repoName: z
        .string()
        .describe(
          "Full repository name in format 'owner/repo', e.g., 'ethereum/go-ethereum'",
        ),
    }),
    execute: async ({ repoName }) => {
      const result = await api.donate.getByName(repoName);
      if (!result.success) {
        return {
          error:
            result.message || "Repository not found or not accepting donations",
        };
      }
      const repo = result.data;
      return {
        name: repo.repo_info.full_name,
        description: repo.repo_info.description || "No description",
        stars: repo.repo_info.stargazers_count,
        url: repo.repo_info.html_url,
        donation: {
          title: repo.repo_donate_data?.title || "Support this project",
          description: repo.repo_donate_data?.description || null,
          network: repo.repo_donate_data?.network || "Unknown",
          payToAddress: repo.repo_donate_data?.payTo || null,
          defaultAmount: repo.repo_donate_data?.defaultAmount || null,
        },
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Event & Hackathon Analysis
  // --------------------------------------------------------------------------

  getEventDeveloperProfile: tool({
    description:
      "Get a developer's profile analyzed for hackathons and Web3 events. Shows their Web3 contributions, ecosystem scores, and event participation data.",
    inputSchema: z.object({
      identifier: z
        .string()
        .describe("GitHub username or GitHub user ID to look up"),
    }),
    execute: async ({ identifier }) => {
      const result = await api.events.getEventDeveloper(identifier);
      if (!result.success) {
        return {
          error: result.message || "Developer not found in event database",
        };
      }
      // Return the full event profile data
      return {
        profile: result.data,
        note: "This is the developer's Web3 event participation profile",
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Repository Deep Analysis
  // --------------------------------------------------------------------------

  getRepositoryActiveDevelopers: tool({
    description:
      "Get the monthly active developer counts for a specific repository. Shows developer engagement trends over time.",
    inputSchema: z.object({
      repoId: z.number().describe("The repository ID (numeric) to analyze"),
    }),
    execute: async ({ repoId }) => {
      const result = await api.repos.getActiveDeveloperList(repoId);
      if (!result.success) {
        return { error: result.message };
      }
      return {
        repoId,
        monthlyActivity: result.data.list.map((record) => ({
          month: record.month,
          activeDevelopers: record.developers,
        })),
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Comparison & Analysis Tools
  // --------------------------------------------------------------------------

  compareEcosystems: tool({
    description:
      "Compare two or more Web3 ecosystems side by side. Shows developer counts, repo counts, growth rates, and rankings.",
    inputSchema: z.object({
      ecosystems: z
        .array(ecosystemSchema)
        .min(2)
        .max(4)
        .describe("List of ecosystems to compare (2-4)"),
    }),
    execute: async ({ ecosystems }) => {
      const result = await api.ecosystems.getRankList();
      if (!result.success) {
        return { error: result.message };
      }

      const ecoData = result.data.list.filter((eco) =>
        ecosystems.includes(eco.eco_name as (typeof ecosystems)[number]),
      );

      if (ecoData.length === 0) {
        return { error: "None of the specified ecosystems found" };
      }

      return {
        comparison: ecoData.map((eco) => ({
          ecosystem: eco.eco_name,
          developers: eco.actors_total,
          coreDevelopers: eco.actors_core_total,
          newDevelopers: eco.actors_new_total,
          repositories: eco.repos_total,
        })),
        note: `Comparing ${ecoData.length} ecosystems`,
      };
    },
  }),

  // --------------------------------------------------------------------------
  // Direct Database Queries (DB Sub-Agent)
  // --------------------------------------------------------------------------

  queryWeb3Data: tool({
    description:
      "Query the Web3Insight analytics database directly for custom data analysis. " +
      "Use for: custom time ranges, cross-ecosystem comparisons, event type breakdowns, " +
      "developer activity patterns, JSONB field analysis, ad-hoc aggregations. " +
      "Not for queries the other specific tools can answer.",
    inputSchema: z.object({
      context: z
        .string()
        .describe("Brief conversation context for the sub-agent"),
      question: z.string().describe("The specific data question to answer"),
    }),
    execute: async ({ context, question }) => {
      // Reason: Dynamic import avoids loading DB/Kysely code at module level
      // when this tool is not invoked, keeping cold starts fast.
      const { executeSubAgentQuery } =
        await import("~/ai/db-sub-agent/execute-sub-agent");
      return executeSubAgentQuery({ context, question });
    },
  }),
};

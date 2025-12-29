import { tool } from "ai";
import { z } from "zod";
import { api } from "@/lib/api/client";

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

export const web3InsightTools = {
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
        })),
      };
    },
  }),

  rankRepositories: tool({
    description:
      "Get the top repositories in a specific Web3 ecosystem ranked by developer activity.",
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
        })),
      };
    },
  }),

  rankContributors: tool({
    description:
      "Get the top contributors (developers) in a specific Web3 ecosystem ranked by activity.",
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

  getCountryDistribution: tool({
    description:
      "Get the geographic distribution of contributors by country for an ecosystem.",
    inputSchema: z.object({
      ecosystem: ecosystemSchema.default("ALL"),
    }),
    execute: async ({ ecosystem }) => {
      const result = await api.actors.getCountryRank({ eco: ecosystem });
      if (!result.success) {
        return { error: result.message };
      }
      const topCountries = result.data.list.slice(0, 10);
      return {
        ecosystem,
        totalContributors: result.data.total,
        topCountries: topCountries.map((c, index) => ({
          rank: index + 1,
          country: c.country,
          count: c.total,
        })),
      };
    },
  }),
};

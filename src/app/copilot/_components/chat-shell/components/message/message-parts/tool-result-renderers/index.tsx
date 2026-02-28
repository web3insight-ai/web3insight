"use client";

import type { ComponentType, ReactNode } from "react";
import { lazy } from "react";
import { cn } from "@/lib/utils";

// -- Shared types -----------------------------------------------------------

export interface ToolResultProps {
  data: unknown;
}

// -- Coercion utility --------------------------------------------------------
// Reason: The backend API returns values as string | number (see
// src/lib/api/client.ts:309-312). This helper safely coerces either type
// to a number so validators and renderers work with real API data.
export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

// -- Number formatting utility ----------------------------------------------

// Reason: Provides compact number display for analytics cards. Numbers under
// 1000 use locale commas; 1K-999K use "K" suffix; 1M+ use "M" suffix.
export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
  }

  return value.toLocaleString();
}

// -- Lazy component imports -------------------------------------------------
// Reason: Using React.lazy so that imports are only evaluated when the
// component is first rendered, avoiding module-load errors while the
// individual renderer files are being created by parallel agents.

const PlatformOverviewResult = lazy(() => import("./platform-overview"));
const EcosystemRankingResult = lazy(() => import("./ecosystem-ranking"));
const ContributorTrendResult = lazy(() => import("./contributor-trend"));
const TrendingReposResult = lazy(() => import("./trending-repos"));
const HotReposResult = lazy(() => import("./hot-repos"));
const TopContributorsResult = lazy(() => import("./top-contributors"));
const TopRepositoriesResult = lazy(() => import("./top-repositories"));
const CountryDistributionResult = lazy(() => import("./country-distribution"));
const DeveloperProfileResult = lazy(() => import("./developer-profile"));
const DeveloperReposResult = lazy(() => import("./developer-repos"));
const EcosystemComparisonResult = lazy(() => import("./ecosystem-comparison"));
const SimpleStatResult = lazy(() => import("./simple-stat"));

// -- Renderer registry ------------------------------------------------------
// Reason: Maps backend tool names to their corresponding visual renderer
// component so the chat UI can display rich results for each tool call.

const TOOL_RENDERERS: Record<string, ComponentType<ToolResultProps>> = {
  getPlatformOverview: PlatformOverviewResult,
  rankEcosystems: EcosystemRankingResult,
  getRecentContributorTrends: ContributorTrendResult,
  getTrendingRepositories: TrendingReposResult,
  getHotRepositories: HotReposResult,
  rankContributors: TopContributorsResult,
  rankRepositories: TopRepositoriesResult,
  getCountryDistribution: CountryDistributionResult,
  getDeveloperProfile: DeveloperProfileResult,
  getDeveloperTopRepositories: DeveloperReposResult,
  compareEcosystems: EcosystemComparisonResult,
  // Simple stat tools
  countRepositories: SimpleStatResult,
  countContributors: SimpleStatResult,
  countEcosystems: SimpleStatResult,
  getContributorGrowth: SimpleStatResult,
};

export function getToolResultRenderer(
  toolName: string,
): ComponentType<ToolResultProps> | null {
  return TOOL_RENDERERS[toolName] ?? null;
}

// -- Shared card wrapper ----------------------------------------------------

export function ToolResultCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-2 rounded-xl bg-gray-50/80 p-4 dark:bg-white/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  );
}

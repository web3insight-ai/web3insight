"use client";

import dynamic from "next/dynamic";
import { Github, Users, TrendingUp } from "lucide-react";

import { CardSkeleton, ChartSkeleton, TableSkeleton } from "$/loading";
import { Panel } from "$/blueprint";
import { SectionHeader, SmallCapsLabel } from "$/primitives";

import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";
import RepositoryTrendingViewWidget from "~/repository/views/repository-trending";

import ClientOnly from "$/ClientOnly";

// Dynamic imports for heavy chart components
const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => <ChartSkeleton title="Loading chart..." height="224px" />,
});

const CountryDistributionChart = dynamic(
  () => import("$/CountryDistributionChart"),
  {
    ssr: false,
    loading: () => (
      <ChartSkeleton title="Global Contributor Distribution" height="500px" />
    ),
  },
);

import { resolveChartOptions } from "./helper";
import MetricOverview from "./MetricOverview";

import type {
  ActorRankRecord,
  ActorTrendRecord,
  ActorCountryRankRecord,
  RepoRankRecord,
  RepoTrendingRecord,
} from "@/lib/api/types";

interface EcosystemStatistics {
  developerTotalCount: number | string;
  developerCoreCount: number | string;
  developerGrowthCount: number | string;
  developers: ActorRankRecord[];
  trend: ActorTrendRecord[];
  repositoryTotalCount: number | string;
  repositories: RepoRankRecord[];
  trendingRepositories: RepoTrendingRecord[];
  countryDistribution: ActorCountryRankRecord[];
  countryDistributionTotal: number;
}

interface EcosystemDetailProps {
  ecosystem: string;
  statistics: EcosystemStatistics | null;
}

export default function EcosystemDetailClient({
  ecosystem,
  statistics,
}: EcosystemDetailProps) {
  // Show loading skeleton while data is being fetched
  const isLoading = !statistics;

  return (
    <div className="w-full max-w-content mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <SectionHeader
          kicker={`ecosystem · ${ecosystem.toLowerCase()}`}
          title={ecosystem}
          deck={`Developer and repository analytics for the ${ecosystem} ecosystem. Metrics pulled from GitHub and OpenDigger, refreshed on schedule.`}
        />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : (
          <MetricOverview className="mb-6" dataSource={statistics!} />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        {isLoading ? (
          <ChartSkeleton
            title="Global Contributor Distribution"
            height="500px"
          />
        ) : (
          <CountryDistributionChart
            className="mb-6"
            data={statistics!.countryDistribution}
            totalDevelopers={statistics!.countryDistributionTotal}
          />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "250ms" }}>
        <ClientOnly>
          {isLoading ? (
            <ChartSkeleton title="Developer Activity Trend" height="320px" />
          ) : (
            <Panel
              label={{ text: "activity · trend", position: "tl" }}
              code="05"
              className="mb-6 p-5"
            >
              <div className="mb-3 flex items-center justify-between border-b border-rule pb-3">
                <SmallCapsLabel>developer activity trend</SmallCapsLabel>
                <TrendingUp
                  size={14}
                  className="text-fg-muted"
                  aria-label="Developers with activity (stars excluded) over time"
                />
              </div>
              <div className="h-56">
                <ReactECharts
                  option={resolveChartOptions(statistics!.trend)}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
              <p className="mt-3 font-mono text-[10px] text-fg-muted/80">
                src: opendigger · monthly rollup
              </p>
            </Panel>
          )}
        </ClientOnly>
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "350ms" }}>
        {isLoading ? (
          <CardSkeleton count={1} />
        ) : (
          <RepositoryTrendingViewWidget
            className="mb-6"
            dataSource={statistics!.trendingRepositories}
          />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        {isLoading ? (
          <TableSkeleton
            title="Top Repositories"
            icon={<Github size={18} className="text-fg-muted" />}
            rows={10}
            columns={6}
          />
        ) : (
          <RepositoryRankViewWidget
            className="mb-6"
            dataSource={statistics!.repositories}
          />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        {isLoading ? (
          <TableSkeleton
            title="Top Contributors"
            icon={<Users size={18} className="text-fg-muted" />}
            rows={10}
            columns={4}
          />
        ) : (
          <DeveloperRankViewWidget dataSource={statistics!.developers} />
        )}
      </div>
    </div>
  );
}

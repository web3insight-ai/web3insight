"use client";

import dynamic from "next/dynamic";
import { Warehouse, Github, Users, TrendingUp } from "lucide-react";

import { CardSkeleton, ChartSkeleton, TableSkeleton } from "$/loading";
import ChartTitle from "$/controls/chart-title";

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
    <div className="w-full max-w-content mx-auto px-6 py-8">
      {/* Header and Overview */}
      <div className="mb-4 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Warehouse size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {ecosystem}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Ecosystem Analytics
            </p>
          </div>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          Comprehensive developer analytics and insights for the {ecosystem}{" "}
          ecosystem.
        </p>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : (
          <MetricOverview className="mb-4" dataSource={statistics!} />
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
            className="mb-4"
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
            <div className="mb-4 border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
              <ChartTitle
                icon={<TrendingUp size={14} />}
                title="Developer Activity Trend"
                tooltip="Developers with activity (star not included) over time"
                className="mb-3"
              />
              <div className="h-56">
                <ReactECharts
                  option={resolveChartOptions(statistics!.trend)}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </div>
          )}
        </ClientOnly>
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "350ms" }}>
        {isLoading ? (
          <CardSkeleton count={1} />
        ) : (
          <RepositoryTrendingViewWidget
            className="mb-4"
            dataSource={statistics!.trendingRepositories}
          />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        {isLoading ? (
          <TableSkeleton
            title="Top Repositories"
            icon={<Github size={18} className="text-primary" />}
            rows={10}
            columns={6}
          />
        ) : (
          <RepositoryRankViewWidget
            className="mb-4"
            dataSource={statistics!.repositories}
          />
        )}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
        {isLoading ? (
          <TableSkeleton
            title="Top Contributors"
            icon={<Users size={18} className="text-secondary" />}
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

'use client';

import { Warehouse, Github, Users , TrendingUp } from "lucide-react";

import { CardSkeleton, ChartSkeleton, TableSkeleton } from "$/loading";
import ReactECharts from 'echarts-for-react';
import ChartTitle from "$/controls/chart-title";

import RepositoryRankViewWidget from "~/repository/views/repository-rank";
import DeveloperRankViewWidget from "~/developer/views/developer-rank";

import ClientOnly from "$/ClientOnly";

import { resolveChartOptions } from "./helper";
import MetricOverview from "./MetricOverview";

interface EcosystemDetailProps {
  ecosystem: string;
  statistics: Record<string, unknown>;
}

export default function EcosystemDetailClient({
  ecosystem,
  statistics,
}: EcosystemDetailProps) {
  // Show loading skeleton while data is being fetched
  const isLoading = !statistics || !statistics.developers || !statistics.repositories;

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        {/* Header and Overview */}
        <div className="mb-4 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Warehouse size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{ecosystem}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">Ecosystem Analytics</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            Comprehensive developer analytics and insights for the {ecosystem} ecosystem.
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            <MetricOverview className="mb-4" dataSource={statistics} />
          )}
        </div>
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
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
                    option={resolveChartOptions(statistics.trend)}
                    style={{ height: '100%', width: '100%' }}
                  />
                </div>
              </div>
            )}
          </ClientOnly>
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
            <RepositoryRankViewWidget className="mb-4" dataSource={statistics.repositories} />
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
            <DeveloperRankViewWidget dataSource={statistics.developers} />
          )}
        </div>
      </div>
    </div>
  );
}

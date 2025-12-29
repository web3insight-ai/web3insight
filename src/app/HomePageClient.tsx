"use client";

import { MetricOverview } from "$/index";
import { useOverviewStatistics } from "@/hooks/api";

export default function HomePageClient() {
  const { data: statisticsData, isLoading: isLoadingStats } =
    useOverviewStatistics();

  const statisticOverview = {
    ecosystem: statisticsData?.totalEcosystems ?? 0,
    repository: statisticsData?.totalRepositories ?? 0,
    developer: statisticsData?.totalDevelopers ?? 0,
    coreDeveloper: statisticsData?.totalCoreDevelopers ?? 0,
  };

  return (
    <MetricOverview dataSource={statisticOverview} isLoading={isLoadingStats} />
  );
}

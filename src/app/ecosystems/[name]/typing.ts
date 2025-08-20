interface MetricOverviewProps {
  className?: string;
  dataSource: {
    developerCoreCount: number;
    developerTotalCount: number;
    developerGrowthCount: number;
    repositoryTotalCount: number;
  };
}

export type { MetricOverviewProps };

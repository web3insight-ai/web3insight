interface MetricOverviewProps {
  className?: string;
  dataSource: {
    developerCoreCount: number | string;
    developerTotalCount: number | string;
    developerGrowthCount: number | string;
    repositoryTotalCount: number | string;
  };
}

export type { MetricOverviewProps };

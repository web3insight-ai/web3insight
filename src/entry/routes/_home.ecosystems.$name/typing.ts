import type { DataValue } from "@/types";

import type { DeveloperTrendRecord } from "~/api/typing";

type MetricOverviewProps = {
  className?: string;
  dataSource: Record<string, DataValue>;
};

type TrendCardProps = {
  className?: string;
  dataSource: DeveloperTrendRecord[];
}

export type { MetricOverviewProps, TrendCardProps };

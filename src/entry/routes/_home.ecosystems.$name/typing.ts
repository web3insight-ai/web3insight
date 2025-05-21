import type { DataValue } from "@/types";

import type { ActorTrendRecord } from "~/api/typing";

type MetricOverviewProps = {
  className?: string;
  dataSource: Record<string, DataValue>;
};

type TrendCardProps = {
  className?: string;
  dataSource: ActorTrendRecord[];
}

export type { MetricOverviewProps, TrendCardProps };

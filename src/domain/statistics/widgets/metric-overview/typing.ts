import type { ReactNode } from "react";
import type { ClassValue } from "clsx";

import type { DataValue } from "@/types";

type MetricCardProps = {
  label: string;
  value: string;
  growth?: number;
  icon: ReactNode;
  iconBgClassName: ClassValue;
};

type MetricOverviewWidgetProps = {
  dataSource: Record<string, DataValue>;
};

export type { MetricCardProps, MetricOverviewWidgetProps };

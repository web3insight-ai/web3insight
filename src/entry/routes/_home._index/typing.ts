import type { PropsWithChildren } from "react";
import type { DataValue } from "@/types";

type MetricOverviewProps = {
  dataSource: Record<string, DataValue>;
};

type MetricSectionProps = PropsWithChildren<{
  className?: string;
  title: string;
  summary: string;
}>

export type { MetricOverviewProps, MetricSectionProps };

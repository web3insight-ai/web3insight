import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";

type ChartCardProps = {
  className?: string;
  style?: CSSProperties;
  title: string;
  option: EChartsOption;
}

export type { ChartCardProps };

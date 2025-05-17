import type { ReactNode } from "react";
import type { ClassValue } from "clsx";

type MetricCardProps = {
  label: string;
  value: string;
  growth?: number;
  icon: ReactNode;
  iconBgClassName: ClassValue;
};

export type { MetricCardProps };

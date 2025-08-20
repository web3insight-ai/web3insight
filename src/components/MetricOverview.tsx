import { Code2, Users, Zap, Database } from "lucide-react";

import MetricCard, { type MetricCardProps } from "$/controls/metric-card";
import MetricOverviewSkeleton from "./loading/MetricOverviewSkeleton";
import type { DataValue } from "@/types";

type MetricOverviewProps = {
  dataSource: Record<string, DataValue>;
  isLoading?: boolean;
};

function resolveMetrics(dataSource: MetricOverviewProps["dataSource"]): MetricCardProps[] {
  return [
    {
      label: "Developers",
      value: Number(dataSource.coreDeveloper).toLocaleString(),
      icon: <Code2 size={20} className="text-secondary" />,
      iconBgClassName: "bg-secondary/10",
    },
    {
      label: "ECO Contributors",
      value: Number(dataSource.developer).toLocaleString(),
      icon: <Users size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
    },
    {
      label: "Ecosystems",
      value: Number(dataSource.ecosystem).toLocaleString(),
      icon: <Database size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
    },
    {
      label: "Repositories",
      value: Number(dataSource.repository).toLocaleString(),
      icon: <Zap size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
    },
  ];
}

function MetricOverview({ dataSource, isLoading = false }: MetricOverviewProps) {
  if (isLoading) {
    return <MetricOverviewSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {resolveMetrics(dataSource).map((metric, index) => (
        <div
          key={metric.label.replaceAll(" ", "")}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MetricCard {...metric} />
        </div>
      ))}
    </div>
  );
}

export default MetricOverview;
export type { MetricOverviewProps };

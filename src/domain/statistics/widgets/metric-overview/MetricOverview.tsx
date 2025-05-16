import { Code2, Users, Zap, Database } from "lucide-react";

import type { MetricCardProps, MetricOverviewWidgetProps } from "./typing";
import MetricCard from "./MetricCard";

function resolveMetrics(dataSource: MetricOverviewWidgetProps["dataSource"]): MetricCardProps[] {
  return [
    {
      label: "Active Developers",
      value: Number(dataSource.developer).toLocaleString(),
      icon: <Users size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
    },
    {
      label: "Core Developers",
      value: Number(dataSource.coreDeveloper).toLocaleString(),
      icon: <Code2 size={20} className="text-secondary" />,
      iconBgClassName: "bg-secondary/10",
    },
    {
      label: "Repositories",
      value: Number(dataSource.repository).toLocaleString(),
      icon: <Zap size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
    },
    {
      label: "Ecosystems",
      value: Number(dataSource.ecosystem).toLocaleString(),
      icon: <Database size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
    },
  ];
}

function MetricOverviewWidget({ dataSource }: MetricOverviewWidgetProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {resolveMetrics(dataSource).map(metric => (
        <MetricCard key={metric.label.replaceAll(" ", "")} {...metric} />
      ))}
    </div>
  );
}

export default MetricOverviewWidget;

import { Code2, Users, Database, Zap } from "lucide-react";
import type { MetricCardProps } from "./typing";

interface OverviewStatistics {
  totalCoreDevelopers: number;
  totalDevelopers: number;
  totalEcosystems: number;
  totalRepositories: number;
}

export function resolveOverviewMetrics(
  stats: OverviewStatistics,
): MetricCardProps[] {
  return [
    {
      label: "Developers",
      value: Number(stats.totalCoreDevelopers).toLocaleString(),
      icon: <Code2 size={20} className="text-secondary" />,
      iconBgClassName: "bg-secondary/10",
      tooltip: "Developers with pull requests and push events in the past year",
    },
    {
      label: "ECO Contributors",
      value: Number(stats.totalDevelopers).toLocaleString(),
      icon: <Users size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
      tooltip:
        "Developers with activity (star not included) in this ecosystem (all time)",
    },
    {
      label: "Ecosystems",
      value: Number(stats.totalEcosystems).toLocaleString(),
      icon: <Database size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
      tooltip: "Total number of ecosystems tracked",
    },
    {
      label: "Repositories",
      value: Number(stats.totalRepositories).toLocaleString(),
      icon: <Zap size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
      tooltip: "Total repositories grouped by ecosystem",
    },
  ];
}

export type { OverviewStatistics };

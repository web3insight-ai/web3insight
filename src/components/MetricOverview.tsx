"use client";

import { Code2, Users, Zap, Database } from "lucide-react";
import { motion } from "framer-motion";

import MetricCard, { type MetricCardProps } from "$/controls/metric-card";
import MetricOverviewSkeleton from "./loading/MetricOverviewSkeleton";
import type { DataValue } from "@/types";
import { staggerContainer, staggerItemScale } from "@/utils/animations";

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
      tooltip: "Developers with pull requests and push events in the past year",
    },
    {
      label: "ECO Contributors",
      value: Number(dataSource.developer).toLocaleString(),
      icon: <Users size={20} className="text-primary" />,
      iconBgClassName: "bg-primary/10",
      tooltip: "Developers with activity (star not included) in this ecosystem (all time)",
    },
    {
      label: "Ecosystems",
      value: Number(dataSource.ecosystem).toLocaleString(),
      icon: <Database size={20} className="text-warning" />,
      iconBgClassName: "bg-warning/10",
      tooltip: "Total number of ecosystems tracked",
    },
    {
      label: "Repositories",
      value: Number(dataSource.repository).toLocaleString(),
      icon: <Zap size={20} className="text-success" />,
      iconBgClassName: "bg-success/10",
      tooltip: "Total repositories grouped by ecosystem",
    },
  ];
}

function MetricOverview({ dataSource, isLoading = false }: MetricOverviewProps) {
  if (isLoading) {
    return <MetricOverviewSkeleton />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {resolveMetrics(dataSource).map((metric) => (
        <motion.div
          key={metric.label.replaceAll(" ", "")}
          variants={staggerItemScale}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default MetricOverview;
export type { MetricOverviewProps };

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Code2, Users, Database, Zap, Network, Sprout } from "lucide-react";
import MetricCard from "$/controls/metric-card";
import type { MetricCardProps } from "$/controls/metric-card";
import Section from "$/section";
import DeveloperGrowthChart from "../../widgets/DeveloperGrowthChart";
import EcosystemBarChart from "../../widgets/EcosystemBarChart";
import TopReposTable from "../../widgets/TopReposTable";
import { getLatestYearStats } from "../../helper";
import { staggerContainer, staggerItemScale } from "@/utils/animations";
import type { YearlyReportData } from "../../typing";

interface YearlyReportProps {
  data: YearlyReportData | null;
}

export default function YearlyReport({ data }: YearlyReportProps) {
  const latestStats = useMemo(
    () => (data ? getLatestYearStats(data) : null),
    [data],
  );

  const publicChainParticipation = useMemo(
    () =>
      data
        ? data.eco_participation.filter((eco) => eco.kind === "Public Chain")
        : [],
    [data],
  );

  const publicChainNewDevelopers = useMemo(
    () =>
      data
        ? data.eco_new_developers.filter((eco) => eco.kind === "Public Chain")
        : [],
    [data],
  );

  const metrics: MetricCardProps[] = useMemo(
    () => [
      {
        label: "Active Devs",
        value: latestStats
          ? latestStats.active_developers.toLocaleString()
          : "—",
        growth: latestStats?.active_developers_yearly_growth_rate ?? undefined,
        icon: <Code2 size={20} className="text-primary" />,
        iconBgClassName: "bg-primary/10",
        tooltip: "Active Chinese Web3 developers in the target year",
      },
      {
        label: "New Devs",
        value: latestStats ? latestStats.new_developers.toLocaleString() : "—",
        growth: latestStats?.new_developers_yearly_growth_rate ?? undefined,
        icon: <Users size={20} className="text-secondary" />,
        iconBgClassName: "bg-secondary/10",
        tooltip: "First-time Chinese Web3 developers in the target year",
      },
      {
        label: "Ecosystems",
        value: publicChainParticipation.length.toLocaleString(),
        icon: <Database size={20} className="text-warning" />,
        iconBgClassName: "bg-warning/10",
        tooltip:
          "Number of public chain ecosystems with Chinese developer participation",
      },
      {
        label: "Top Repos",
        value: data ? data.top_repos.length.toLocaleString() : "—",
        icon: <Zap size={20} className="text-success" />,
        iconBgClassName: "bg-success/10",
        tooltip: "Repositories with the most Chinese developer contributions",
      },
    ],
    [latestStats, data, publicChainParticipation],
  );

  if (!data) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Report data is not available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chinese Web3 Developer Report {data.target_year}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          A data-driven overview of developer activity across Web3 ecosystems
        </p>
      </div>

      {/* Metric Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.label}
            variants={staggerItemScale}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      {/* Section 1: Developer Growth Trends */}
      {data.yearly_stats.length > 0 && (
        <Section
          className="mt-16"
          title="Developer Growth Trends"
          summary="Active and new Chinese Web3 developers over the past years"
        >
          <DeveloperGrowthChart data={data.yearly_stats} />
        </Section>
      )}

      {/* Section 2: Ecosystem Participation (Public Chains Only) */}
      {publicChainParticipation.length > 0 && (
        <Section
          className="mt-16"
          title="Ecosystem Participation"
          summary="Where Chinese developers are most active across public chains"
        >
          <EcosystemBarChart
            data={publicChainParticipation}
            title="Developer Distribution"
            subtitle="Active developers per public chain"
            icon={<Network size={18} className="text-primary" />}
            valueKey="developer_count"
          />
        </Section>
      )}

      {/* Section 3: New Developer Distribution (Public Chains Only) */}
      {publicChainNewDevelopers.length > 0 && (
        <Section
          className="mt-16"
          title="New Developer Distribution"
          summary="Which public chains attracted the most newcomers"
        >
          <EcosystemBarChart
            data={publicChainNewDevelopers}
            title="New Developer Inflow"
            subtitle="First-time contributors per public chain"
            icon={<Sprout size={18} className="text-success" />}
            valueKey="new_developer_count"
          />
        </Section>
      )}

      {/* Section 4: Top Repositories */}
      {data.top_repos.length > 0 && (
        <Section
          className="mt-16"
          title="Top Repositories"
          summary="Repositories with the most Chinese developer contributions"
        >
          <TopReposTable data={data.top_repos} />
        </Section>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border dark:border-border-dark">
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Data sourced from GitHub public events &middot; Analysis by
            Web3Insight
          </p>
        </div>
      </footer>
    </div>
  );
}

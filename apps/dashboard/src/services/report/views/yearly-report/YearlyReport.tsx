"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Network, Sprout } from "lucide-react";
import Section from "$/section";
import { Panel } from "$/blueprint";
import { BigNumber } from "$/primitives";
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

  const metrics = useMemo(
    () => [
      {
        code: "01",
        label: "active devs",
        value: latestStats?.active_developers ?? 0,
        footnote: "Active Chinese Web3 devs",
        ground: "dotted" as const,
      },
      {
        code: "02",
        label: "new devs",
        value: latestStats?.new_developers ?? 0,
        footnote: "First-time contributors",
        ground: "plain" as const,
      },
      {
        code: "03",
        label: "ecosystems",
        value: publicChainParticipation.length,
        footnote: "Public chains tracked",
        ground: "hatched" as const,
      },
      {
        code: "04",
        label: "top repos",
        value: data ? data.top_repos.length : 0,
        footnote: "Highest-impact repositories",
        ground: "plain" as const,
      },
    ],
    [latestStats, data, publicChainParticipation],
  );

  if (!data) {
    return (
      <div className="text-center py-32">
        <p className="text-fg-muted text-lg">
          Report data is not available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-fg">
          Chinese Web3 Developer Report {data.target_year}
        </h1>
        <p className="text-sm text-fg-muted mt-2">
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
          <motion.div key={metric.label} variants={staggerItemScale}>
            <Panel
              ground={metric.ground}
              label={{ text: metric.label, position: "tl" }}
              code={metric.code}
              className="p-5 h-full"
            >
              <BigNumber
                label=""
                value={metric.value}
                format="compact"
                footnote={metric.footnote}
              />
            </Panel>
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
            icon={<Network size={18} className="text-accent" />}
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
      <footer className="mt-16 pt-8 border-t border-rule">
        <div className="text-center">
          <p className="text-xs text-fg-subtle">
            Data sourced from GitHub public events &middot; Analysis by
            Web3Insight
          </p>
        </div>
      </footer>
    </div>
  );
}

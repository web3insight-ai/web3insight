"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

import type { RepositoryDeveloperActivityViewWidgetProps } from "./typing";

type ChartDatum = {
  id: string;
  repoId: number | string;
  repoName: string;
  displayName: string;
  developerCount: number;
  starCount: number;
  forkCount: number;
  issueCount: number;
  description: string;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const SENSITIVE_REPOSITORIES = new Set([
  "MetaMask/metamask-mobile",
  "MetaMask/metamask-extension",
  "LedgerHQ/ledger-live",
]);

function RepositoryDeveloperActivityView({
  className,
  dataSource,
}: RepositoryDeveloperActivityViewWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [includeSensitive, setIncludeSensitive] = useState(false);

  const normalizedData = useMemo<ChartDatum[]>(() => {
    if (!Array.isArray(dataSource)) {
      return [];
    }

    return dataSource
      .map((repo) => ({
        id: String(repo.repo_id ?? repo.repo_name),
        repoId: repo.repo_id ?? "unknown",
        repoName: repo.repo_name || "Unknown Repository",
        displayName:
          repo.repo_name?.split("/").pop() ||
          repo.repo_name ||
          "Unknown Repository",
        developerCount: Number.isFinite(Number(repo.dev_7_day))
          ? Number(repo.dev_7_day)
          : 0,
        starCount: Number.isFinite(Number(repo.star_count))
          ? Number(repo.star_count)
          : 0,
        forkCount: Number.isFinite(Number(repo.forks_count))
          ? Number(repo.forks_count)
          : 0,
        issueCount: Number.isFinite(Number(repo.open_issues_count))
          ? Number(repo.open_issues_count)
          : 0,
        description: repo.description || "",
      }))
      .filter((item) => item.repoName && item.developerCount > 0)
      .sort((a, b) => {
        if (b.developerCount === a.developerCount) {
          if (b.starCount === a.starCount) {
            return b.forkCount - a.forkCount;
          }

          return b.starCount - a.starCount;
        }

        return b.developerCount - a.developerCount;
      });
  }, [dataSource]);

  const filteredData = useMemo<ChartDatum[]>(() => {
    if (includeSensitive) {
      return normalizedData;
    }

    return normalizedData.filter(
      (repo) => !SENSITIVE_REPOSITORIES.has(repo.repoName),
    );
  }, [normalizedData, includeSensitive]);

  const chartData = useMemo<ChartDatum[]>(
    () => filteredData.slice(0, 10),
    [filteredData],
  );
  const listData = useMemo<ChartDatum[]>(
    () => filteredData.slice(0, isExpanded ? 50 : 10),
    [filteredData, isExpanded],
  );
  const hasData = chartData.length > 0;

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: { payload: ChartDatum }[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-bg-raised border border-rule rounded-[2px] p-3 max-w-xs">
          <div className="text-xs font-semibold text-fg mb-1">
            {data.repoName}
          </div>
          <p className="text-xs text-fg-muted mb-2 line-clamp-3">
            {data.description || "No description provided."}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Active Developers (7d)</span>
              <span className="font-semibold text-accent font-mono tabular-nums">
                {formatNumber(data.developerCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Stars</span>
              <span className="font-semibold text-fg font-mono tabular-nums">
                {formatNumber(data.starCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Forks</span>
              <span className="font-semibold text-fg font-mono tabular-nums">
                {formatNumber(data.forkCount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-fg-muted">Open Issues</span>
              <span className="font-semibold text-fg font-mono tabular-nums">
                {formatNumber(data.issueCount)}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Panel
      label={{ text: "weekly · participation", position: "tl" }}
      className={`overflow-hidden ${className || ""}`}
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="min-w-0">
            <SmallCapsLabel>Weekly Developer Participation</SmallCapsLabel>
            <p className="text-xs text-fg-muted mt-1">
              Repositories with the most active contributors in the past 7 days
            </p>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <button
              type="button"
              onClick={() => setIncludeSensitive((prev) => !prev)}
              className="inline-flex items-center justify-center w-4 h-4 rounded-[2px] border border-accent text-accent hover:bg-accent-subtle transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-[10px]"
              aria-pressed={includeSensitive}
              aria-label={
                includeSensitive
                  ? "Hide flagged repositories"
                  : "Show flagged repositories"
              }
              title={
                includeSensitive
                  ? "Hide flagged repositories"
                  : "Show flagged repositories"
              }
            >
              {includeSensitive ? (
                <Eye size={9} strokeWidth={1.8} />
              ) : (
                <EyeOff size={9} strokeWidth={1.8} />
              )}
            </button>
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-fg-muted">
              Showing top {chartData.length}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 pt-5 space-y-6">
        {hasData ? (
          <>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 12, right: 24, left: 24, bottom: 12 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="opacity-20"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickFormatter={(value) => formatNumber(Number(value))}
                  />
                  <YAxis
                    dataKey="displayName"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={120}
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickFormatter={(value: string) =>
                      value && value.length > 24
                        ? `${value.slice(0, 23)}…`
                        : value
                    }
                  />
                  <Tooltip
                    content={renderTooltip}
                    cursor={{ fill: "rgba(13, 148, 136, 0.08)" }}
                  />
                  <Bar
                    dataKey="developerCount"
                    fill="var(--teal-500)"
                    radius={[0, 0, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {listData.map((repo, index) => (
                <div
                  key={repo.id}
                  className="group border border-rule rounded-[2px] p-3 bg-bg-raised hover:bg-bg-sunken transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center pt-0.5">
                      <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                        {String(index + 1).padStart(3, "0")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/repositories/${encodeURIComponent(String(repo.repoId || "unknown"))}?name=${encodeURIComponent(repo.repoName)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-fg hover:text-accent transition-colors duration-200 truncate"
                          >
                            {repo.repoName}
                          </Link>
                          <p className="text-xs text-fg-muted truncate mt-1 pr-2">
                            {repo.description || "No description provided."}
                          </p>
                        </div>
                        <div className="text-right space-y-1 whitespace-nowrap pl-2">
                          <div className="text-sm font-semibold text-accent font-mono tabular-nums">
                            {formatNumber(repo.developerCount)} devs
                          </div>
                          <div className="text-xs text-fg-muted font-mono tabular-nums">
                            {formatNumber(repo.starCount)} stars ·{" "}
                            {formatNumber(repo.forkCount)} forks ·{" "}
                            {formatNumber(repo.issueCount)} open issues
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-72 w-full flex items-center justify-center text-sm text-fg-muted text-center px-6">
            Flagged repositories are hidden. Toggle the button above to view
            them.
          </div>
        )}
        <div className="px-6 py-4 border-t border-rule">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-accent transition-colors duration-200"
            disabled={!hasData && !includeSensitive}
          >
            {isExpanded ? "Show less" : "View All Repositories"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default RepositoryDeveloperActivityView;

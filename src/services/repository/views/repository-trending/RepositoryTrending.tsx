'use client';

import { useMemo, useState } from "react";
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { RepositoryTrendingViewWidgetProps } from "./typing";

type ChartDatum = {
  id: string;
  repoId: number | string;
  repoName: string;
  displayName: string;
  starGrowth: number;
  starCount: number;
  description: string;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

function RepositoryTrendingView({ className, dataSource }: RepositoryTrendingViewWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedData = useMemo<ChartDatum[]>(() => {
    if (!Array.isArray(dataSource)) {
      return [];
    }

    return dataSource
      .map(repo => ({
        id: String(repo.repo_id ?? repo.repo_name),
        repoId: repo.repo_id ?? "unknown",
        repoName: repo.repo_name || "Unknown Repository",
        displayName: repo.repo_name?.split("/").pop() || repo.repo_name || "Unknown Repository",
        starGrowth: Number.isFinite(Number(repo.star_growth_7d)) ? Number(repo.star_growth_7d) : 0,
        starCount: Number.isFinite(Number(repo.star_count)) ? Number(repo.star_count) : 0,
        description: repo.description || "",
      }))
      .filter(item => item.repoName && (item.starGrowth > 0 || item.starCount > 0))
      .sort((a, b) => {
        if (b.starGrowth === a.starGrowth) {
          return b.starCount - a.starCount;
        }
        return b.starGrowth - a.starGrowth;
      });
  }, [dataSource]);

  const chartData = useMemo<ChartDatum[]>(() => normalizedData.slice(0, 10), [normalizedData]);
  const listData = useMemo<ChartDatum[]>(() => normalizedData.slice(0, isExpanded ? 50 : 10), [normalizedData, isExpanded]);

  if (chartData.length === 0) {
    return null;
  }

  const renderTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartDatum }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-3 shadow-subtle max-w-xs">
          <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
            {data.repoName}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-3">
            {data.description || "No description provided."}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">7d Growth</span>
              <span className="font-semibold text-primary">+{formatNumber(data.starGrowth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Stars</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(data.starCount)}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const cardClassName = [
    "bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden",
    className || "",
  ].join(" ").trim();

  return (
    <Card className={cardClassName}>
      <CardHeader className="px-6 py-5">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Weekly Star Momentum
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Top repositories by 7-day star growth
              </p>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
            Showing top {chartData.length}
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-6 pb-6 pt-0 space-y-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 12, right: 24, left: 24, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="opacity-20" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                tickFormatter={value => formatNumber(Number(value))}
              />
              <YAxis
                dataKey="displayName"
                type="category"
                axisLine={false}
                tickLine={false}
                width={120}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                tickFormatter={(value: string) => (value && value.length > 24 ? `${value.slice(0, 23)}…` : value)}
              />
              <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }} />
              <Bar dataKey="starGrowth" fill="#0D9488" radius={[6, 6, 6, 6]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {listData.map((repo, index) => (
            <div
              key={repo.id}
              className="group border border-border dark:border-border-dark rounded-lg p-3 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-surface-elevated transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center pt-0.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/repositories/${encodeURIComponent(String(repo.repoId || "unknown"))}?name=${encodeURIComponent(repo.repoName)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary transition-colors duration-200 truncate"
                      >
                        {repo.repoName}
                      </Link>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1 pr-2">
                        {repo.description || "No description provided."}
                      </p>
                    </div>
                    <div className="text-right space-y-1 whitespace-nowrap pl-2">
                      <div className="text-sm font-semibold text-primary">
                        +{formatNumber(repo.starGrowth)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(repo.starCount)} total stars
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-border-dark">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            {isExpanded ? "Show less" : "View All Repositories"}
            <ArrowRight size={16} />
          </button>
        </div>
      </CardBody>
    </Card>
  );
}

export default RepositoryTrendingView;

"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, createViewportAnimation } from "@/utils/animations";
import { formatGrowthRate } from "../helper";
import type { YearlyDeveloperStat } from "../typing";

interface DeveloperGrowthChartProps {
  data: YearlyDeveloperStat[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: YearlyDeveloperStat & { year: string };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const stats = payload[0].payload;

  return (
    <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg p-4 min-w-[220px]">
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {label}
      </p>
      <div className="space-y-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Active Developers
            </span>
          </div>
          <div className="flex items-center gap-2 pl-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
              {Number(stats.active_developers).toLocaleString()}
            </span>
            {stats.active_developers_yearly_growth_rate !== null && (
              <span
                className={`text-xs font-medium ${Number(stats.active_developers_yearly_growth_rate) >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {formatGrowthRate(stats.active_developers_yearly_growth_rate)}
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              New Developers
            </span>
          </div>
          <div className="flex items-center gap-2 pl-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
              {Number(stats.new_developers).toLocaleString()}
            </span>
            {stats.new_developers_yearly_growth_rate !== null && (
              <span
                className={`text-xs font-medium ${Number(stats.new_developers_yearly_growth_rate) >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {formatGrowthRate(stats.new_developers_yearly_growth_rate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperGrowthChart({
  data,
}: DeveloperGrowthChartProps) {
  const chartData = useMemo(
    () =>
      data.map((stat) => ({
        ...stat,
        year: String(stat.activity_year),
        active_developers: Number(stat.active_developers),
        new_developers: Number(stat.new_developers),
      })),
    [data],
  );

  const latestStat = chartData[chartData.length - 1];

  return (
    <motion.div variants={fadeInUp} {...createViewportAnimation()}>
      <div className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden">
        {/* Header with key stats */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <TrendingUp size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  Developer Growth Trends
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Active and new developers over the past years
                </p>
              </div>
            </div>

            {/* Quick stat callouts */}
            {latestStat && (
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {latestStat.active_developers.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Active
                    </p>
                    {latestStat.active_developers_yearly_growth_rate !==
                      null && (
                      <span
                        className={`inline-flex items-center text-[10px] font-medium ${Number(latestStat.active_developers_yearly_growth_rate) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {Number(
                          latestStat.active_developers_yearly_growth_rate,
                        ) >= 0 ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                        {Math.abs(
                          Number(
                            latestStat.active_developers_yearly_growth_rate,
                          ),
                        )}
                        %
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {latestStat.new_developers.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      New
                    </p>
                    {latestStat.new_developers_yearly_growth_rate !== null && (
                      <span
                        className={`inline-flex items-center text-[10px] font-medium ${Number(latestStat.new_developers_yearly_growth_rate) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {Number(latestStat.new_developers_yearly_growth_rate) >=
                        0 ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                        {Math.abs(
                          Number(latestStat.new_developers_yearly_growth_rate),
                        )}
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="px-4 pb-6" style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(15, 118, 110, 0.04)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="active_developers"
                name="Active Developers"
                fill="#0F766E"
                fillOpacity={0.8}
                radius={[6, 6, 0, 0]}
                maxBarSize={52}
              />
              <Line
                dataKey="new_developers"
                name="New Developers"
                type="monotone"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{
                  r: 5,
                  fill: "#6366F1",
                  strokeWidth: 3,
                  stroke: "#fff",
                }}
                activeDot={{ r: 7, strokeWidth: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

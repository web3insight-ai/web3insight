"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, createViewportAnimation } from "@/utils/animations";

interface EcoItem {
  ecosystem_name: string;
  active?: boolean | null;
  kind?: string | null;
  developer_count?: number;
  new_developer_count?: number;
}

interface EcosystemBarChartProps {
  data: EcoItem[];
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  valueKey: "developer_count" | "new_developer_count";
  limit?: number;
}

const BAR_COLORS = [
  "#0D9488",
  "#14B8A6",
  "#10B981",
  "#059669",
  "#0F766E",
  "#6366F1",
  "#818CF8",
  "#A78BFA",
  "#8B5CF6",
  "#7C3AED",
];

export default function EcosystemBarChart({
  data,
  title,
  subtitle,
  icon,
  valueKey,
  limit = 20,
}: EcosystemBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const sorted = [...data].sort(
      (a, b) => Number(b[valueKey] ?? 0) - Number(a[valueKey] ?? 0),
    );
    return sorted.slice(0, limit).map((item) => ({
      name: item.ecosystem_name,
      value: Number(item[valueKey] ?? 0),
      kind: item.kind ?? null,
    }));
  }, [data, valueKey, limit]);

  const maxValue = useMemo(
    () => chartData.reduce((max, item) => Math.max(max, item.value), 0),
    [chartData],
  );

  const totalCount = useMemo(
    () => data.reduce((sum, item) => sum + Number(item[valueKey] ?? 0), 0),
    [data, valueKey],
  );

  return (
    <motion.div variants={fadeInUp} {...createViewportAnimation()}>
      <div className="rounded-2xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">{icon}</div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {totalCount.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              total devs
            </p>
          </div>
        </div>

        {/* Custom Bar Chart */}
        <div className="px-6 pb-6 space-y-1.5">
          <AnimatePresence>
            {chartData.map((item, index) => {
              const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              const color = BAR_COLORS[index % BAR_COLORS.length];
              const isHovered = hoveredIndex === index;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.4 }}
                  className="group flex items-center gap-3 py-1 cursor-default"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Rank number */}
                  <span className="w-5 text-[10px] text-gray-400 dark:text-gray-500 tabular-nums text-right shrink-0">
                    {index + 1}
                  </span>

                  {/* Name */}
                  <span
                    className="w-28 text-xs text-gray-600 dark:text-gray-300 truncate shrink-0 transition-colors"
                    style={{ color: isHovered ? color : undefined }}
                    title={item.name}
                  >
                    {item.name}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 h-5 bg-gray-50 dark:bg-gray-800/50 rounded overflow-hidden relative">
                    <motion.div
                      className="h-full rounded transition-all duration-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{
                        delay: index * 0.03 + 0.2,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      style={{
                        backgroundColor: color,
                        opacity: isHovered ? 1 : 0.75,
                      }}
                    />
                    {isHovered && item.kind && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 dark:text-gray-400">
                        {item.kind}
                      </span>
                    )}
                  </div>

                  {/* Value */}
                  <span
                    className="w-12 text-xs font-medium tabular-nums text-right shrink-0 transition-colors"
                    style={{ color: isHovered ? color : undefined }}
                  >
                    {item.value.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { Code } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Language {
  name: string;
  percentage: string;
}

interface GitHubLanguagesChartProps {
  languages: Language[];
  className?: string;
}

const LANGUAGE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
];

export default function GitHubLanguagesChart({ languages, className = "" }: GitHubLanguagesChartProps) {
  if (!languages || languages.length === 0) {
    return (
      <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Most Used Languages</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">No language data available</p>
        </div>
      </div>
    );
  }

  // Convert percentage strings to numbers for chart
  const chartData = languages.map((lang, index) => ({
    name: lang.name,
    value: parseFloat(lang.percentage.replace('%', '')),
    color: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-900 dark:text-white">
            {data.name}: {data.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Code size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Most Used Languages</h3>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {chartData.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {lang.name}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-auto">
              {lang.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

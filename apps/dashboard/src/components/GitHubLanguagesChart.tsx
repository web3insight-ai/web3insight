"use client";

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

// Teal-dominant sequential ramp. Primary series gets the brand accent;
// secondary series step toward lighter/darker teals. No rainbow — consistent
// with the Blueprint "one rare teal, many tinted neutrals" rule.
const LANGUAGE_COLORS = [
  "var(--accent)",
  "var(--teal-300)",
  "var(--teal-700)",
  "var(--teal-200)",
  "var(--teal-800)",
  "var(--teal-400)",
  "var(--teal-600)",
  "var(--teal-100)",
];

export default function GitHubLanguagesChart({
  languages,
  className = "",
}: GitHubLanguagesChartProps) {
  if (!languages || languages.length === 0) {
    return (
      <div
        className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-fg-muted" />
          <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-fg-muted">
            most used languages
          </h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-fg-muted">No language data available</p>
        </div>
      </div>
    );
  }

  // Convert percentage strings to numbers for chart
  const chartData = languages.map((lang, index) => ({
    name: lang.name,
    value: parseFloat(lang.percentage.replace("%", "")),
    color: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length],
  }));

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-raised p-2 rounded-[2px] border border-rule-strong">
          <p className="font-mono text-xs font-medium text-fg">
            {data.name}: <span className="tabular-nums">{data.value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Code size={14} className="text-fg-muted" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-fg-muted">
          most used languages
        </h3>
      </div>

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

      <div className="grid grid-cols-2 gap-2 mt-3">
        {chartData.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-xs text-fg truncate">{lang.name}</span>
            <span className="font-mono text-xs font-medium text-fg-muted ml-auto tabular-nums">
              {lang.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

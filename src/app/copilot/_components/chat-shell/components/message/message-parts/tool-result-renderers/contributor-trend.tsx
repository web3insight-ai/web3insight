"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ToolResultCard, toNumber } from "./index";

interface ContributorTrendData {
  ecosystem: string;
  period: string;
  trends: Array<{ date: string; total: number | string }>;
}

function isValidData(data: unknown): data is ContributorTrendData {
  if (!data || typeof data !== "object") return false;
  if (!("ecosystem" in data) || !("trends" in data)) return false;

  const d = data as ContributorTrendData;
  if (typeof d.ecosystem !== "string") return false;
  if (!Array.isArray(d.trends)) return false;

  return d.trends.every(
    (t) => typeof t.date === "string" && toNumber(t.total) !== null,
  );
}

export default function ContributorTrendResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { ecosystem, trends } = data;

  // Reason: Coerce string values to numbers for Recharts
  const chartData = trends.map((t) => ({
    date: t.date,
    total: toNumber(t.total) ?? 0,
  }));

  return (
    <ToolResultCard>
      <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
        Contributor Growth &mdash; {ecosystem}
      </h4>

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af" }}
          />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9ca3af" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "8px",
              color: "#374151",
              fontSize: "12px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          />
          <Bar
            dataKey="total"
            fill="#0d9488"
            fillOpacity={0.3}
            radius={[3, 3, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#0d9488"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ToolResultCard>
  );
}

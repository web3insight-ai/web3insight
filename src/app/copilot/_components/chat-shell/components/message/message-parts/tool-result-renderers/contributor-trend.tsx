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
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-dark, #1f2937)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f3f4f6",
            }}
          />
          <Bar
            dataKey="total"
            fill="#6366f1"
            fillOpacity={0.3}
            radius={[2, 2, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ToolResultCard>
  );
}

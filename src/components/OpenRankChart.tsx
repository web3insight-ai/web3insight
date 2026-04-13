"use client";

import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OpenRankChartProps {
  data: Record<string, number>;
  repoName: string;
}

function OpenRankChart({ data, repoName }: OpenRankChartProps) {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const chartData = useMemo(() => {
    const keys = Object.keys(data).filter((k) => k.length === 7);
    return keys.map((key) => ({
      month: key,
      value: data[key],
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] md:h-[400px] text-fg-muted">
        No OpenRank data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3
        className="text-center font-display font-semibold tracking-[-0.01em] mb-4 text-fg"
        style={{ fontSize: isMobile ? 14 : 18 }}
      >
        OpenRank for {repoName}
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 20 : 40,
            left: isMobile ? 40 : 80,
            bottom: isMobile ? 60 : 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--fg-muted)" }}
            stroke="var(--rule)"
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? "end" : "middle"}
            height={isMobile ? 60 : 30}
          />
          <YAxis
            tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--fg-muted)" }}
            stroke="var(--rule)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--rule-strong)",
              borderRadius: 2,
              color: "var(--fg)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
            formatter={(value: number) => [value.toFixed(2), "OpenRank"]}
          />
          <Bar
            dataKey="value"
            fill="var(--accent)"
            radius={[0, 0, 0, 0]}
            name="OpenRank"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OpenRankChart;

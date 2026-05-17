"use client";

import { useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttentionChartProps {
  data: Record<string, number>;
  repoName: string;
}

function AttentionChart({ data, repoName }: AttentionChartProps) {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const chartData = useMemo(() => {
    const keys = Object.keys(data).filter((k) => k.length === 7);
    let accumulated = 0;

    return keys.map((key) => {
      accumulated += data[key];
      return {
        month: key,
        attention: data[key],
        accumulated,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] md:h-[400px] text-fg-muted">
        No Attention data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3
        className="text-center font-display font-semibold tracking-[-0.01em] mb-4 text-fg"
        style={{ fontSize: isMobile ? 14 : 18 }}
      >
        Attention for {repoName}
      </h3>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: isMobile ? 20 : 40,
            left: isMobile ? 40 : 80,
            bottom: isMobile ? 80 : 60,
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
            yAxisId="left"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--fg-muted)" }}
            stroke="var(--rule)"
            orientation="left"
          />
          <YAxis
            yAxisId="right"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "var(--fg-muted)" }}
            stroke="var(--rule)"
            orientation="right"
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
            formatter={(value: number, name: string) => [
              value.toFixed(2),
              name === "attention" ? "Attention" : "Accumulated Attention",
            ]}
          />
          <Legend
            wrapperStyle={{
              fontSize: isMobile ? 10 : 12,
              color: "var(--fg-muted)",
            }}
            verticalAlign="bottom"
          />
          <Bar
            yAxisId="left"
            dataKey="attention"
            fill="var(--teal-300)"
            radius={[0, 0, 0, 0]}
            name="Attention"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accumulated"
            stroke="var(--accent)"
            strokeWidth={1.5}
            dot={false}
            name="Accumulated Attention"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttentionChart;

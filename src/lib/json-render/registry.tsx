"use client";

import { defineRegistry } from "@json-render/react";
import {
  Area,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  Pie,
  BarChart as RechartsBarChart,
  ComposedChart as RechartsComposedChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { web3InsightCatalog } from "./catalog";
import {
  CHART_COLORS,
  TOOLTIP_STYLE,
  formatNumber,
  normalizeChartRows,
  normalizeComposedSeries,
  processChartData,
  processComposedChartData,
  toNumber,
  type ComposedSeriesConfig,
  type NormalizedComposedSeriesConfig,
} from "./chart-helpers";

// ---------------------------------------------------------------------------
// Shared axis & grid styles
// ---------------------------------------------------------------------------

const AXIS_PROPS = {
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tick: { fill: "#9ca3af" },
} as const;

const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "rgba(0,0,0,0.06)",
  vertical: false,
} as const;

// Reason: Truncate long x-axis labels (e.g. ISO date strings) to a readable
// short form so charts stay clean.
function formatXLabel(value: unknown): string {
  const str = String(value ?? "");
  if (str.length <= 12) return str;
  // Reason: ISO date -> YYYY-MM
  const isoMatch = /^(\d{4}-\d{2})/.exec(str);
  if (isoMatch) return isoMatch[1];
  return str.slice(0, 10) + "...";
}

// ---------------------------------------------------------------------------
// Chart title component
// ---------------------------------------------------------------------------

function ChartTitle({ children }: { children: string }) {
  return (
    <h4 className="mb-3 text-[13px] font-semibold tracking-tight text-gray-800 dark:text-gray-200">
      {children}
    </h4>
  );
}

// ---------------------------------------------------------------------------
// Composed chart series renderer
// ---------------------------------------------------------------------------

function renderComposedSeries(
  series: NormalizedComposedSeriesConfig[],
): ReactNode[] {
  return series.map((s) => {
    const key = s.type + "-" + s.dataKey;
    switch (s.type) {
    case "bar":
      return (
        <Bar
          key={key}
          dataKey={s.dataKey}
          name={s.name}
          fill={s.color}
          fillOpacity={s.fillOpacity}
          barSize={s.barSize}
          stackId={s.stackId}
          radius={[3, 3, 0, 0]}
        />
      );
    case "line":
      return (
        <Line
          key={key}
          type={s.curveType}
          dataKey={s.dataKey}
          name={s.name}
          stroke={s.color}
          strokeWidth={s.strokeWidth}
          dot={s.dot}
        />
      );
    case "area":
      return (
        <Area
          key={key}
          type={s.curveType}
          dataKey={s.dataKey}
          name={s.name}
          stroke={s.color}
          fill={s.color}
          fillOpacity={s.fillOpacity}
          strokeWidth={s.strokeWidth}
          dot={s.dot}
        />
      );
    case "scatter":
      return (
        <Scatter key={key} dataKey={s.dataKey} name={s.name} fill={s.color} />
      );
    default:
      return null;
    }
  });
}

// ---------------------------------------------------------------------------
// Registry definition
// ---------------------------------------------------------------------------

const { registry: web3InsightRegistry } = defineRegistry(web3InsightCatalog, {
  components: {
    Stack: ({ props, children }) => {
      const direction = props.direction ?? "vertical";
      const gap = props.gap ?? 12;

      return (
        <div
          className={cn(
            "flex",
            direction === "horizontal"
              ? "flex-row flex-wrap items-start"
              : "flex-col",
          )}
          style={{ gap: gap + "px" }}
        >
          {children}
        </div>
      );
    },

    MetricCard: ({ props }) => (
      <div
        className={cn(
          "min-w-[140px] flex-1 rounded-xl p-4",
          "bg-gray-50/80 dark:bg-white/[0.04]",
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {props.label}
        </p>
        <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
          {props.value}
        </p>
        {props.detail && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {props.detail}
          </p>
        )}
      </div>
    ),

    BarChart: ({ props }) => {
      const chartData = processChartData(
        props.data,
        props.xKey,
        props.yKey,
        props.aggregate,
      );
      const color = props.color ?? CHART_COLORS[0];
      const height = props.height ?? 280;

      return (
        <div>
          {props.title && <ChartTitle>{props.title}</ChartTitle>}
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey={props.xKey}
                {...AXIS_PROPS}
                tickFormatter={formatXLabel}
              />
              <YAxis {...AXIS_PROPS} tickFormatter={formatNumber} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey={props.yKey}
                fill={color}
                fillOpacity={0.85}
                radius={[3, 3, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      );
    },

    LineChart: ({ props }) => {
      const chartData = processChartData(
        props.data,
        props.xKey,
        props.yKey,
        props.aggregate,
      );
      const color = props.color ?? CHART_COLORS[0];
      const height = props.height ?? 280;

      return (
        <div>
          {props.title && <ChartTitle>{props.title}</ChartTitle>}
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey={props.xKey}
                {...AXIS_PROPS}
                tickFormatter={formatXLabel}
              />
              <YAxis {...AXIS_PROPS} tickFormatter={formatNumber} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey={props.yKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      );
    },

    ComposedChart: ({ props }) => {
      const rawSeries = Array.isArray(props.series) ? props.series : [];
      const series = normalizeComposedSeries(
        rawSeries as ComposedSeriesConfig[],
      );
      const chartData = processComposedChartData(
        props.data,
        props.xKey,
        series,
        props.aggregate,
      );
      const height = props.height ?? 280;
      const showLegend = props.showLegend ?? false;

      return (
        <div>
          {props.title && <ChartTitle>{props.title}</ChartTitle>}
          <ResponsiveContainer width="100%" height={height}>
            <RechartsComposedChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey={props.xKey}
                {...AXIS_PROPS}
                tickFormatter={formatXLabel}
              />
              <YAxis {...AXIS_PROPS} tickFormatter={formatNumber} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              {showLegend && (
                <Legend
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }}
                />
              )}
              {renderComposedSeries(series)}
            </RechartsComposedChart>
          </ResponsiveContainer>
        </div>
      );
    },

    PieChart: ({ props }) => {
      const rawData = normalizeChartRows(props.data);
      const height = props.height ?? 280;

      const chartData = rawData.map((d, i) => ({
        ...d,
        fill: CHART_COLORS[i % CHART_COLORS.length],
        [props.valueKey]: toNumber(d[props.valueKey]) ?? 0,
      }));

      return (
        <div>
          {props.title && <ChartTitle>{props.title}</ChartTitle>}
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Pie
                data={chartData}
                dataKey={props.valueKey}
                nameKey={props.nameKey}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius="45%"
                paddingAngle={2}
                strokeWidth={0}
                label={({ name }: { name?: string }) => name ?? ""}
                labelLine={false}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      );
    },

    DataTable: ({ props }) => {
      const rawRows = normalizeChartRows(props.rows);
      const columns = Array.isArray(props.columns) ? props.columns : [];
      const maxRows = props.maxRows ?? 20;
      const rows = rawRows.slice(0, maxRows);

      return (
        <div>
          {props.title && <ChartTitle>{props.title}</ChartTitle>}
          <div className="overflow-x-auto rounded-lg bg-gray-50/50 dark:bg-white/[0.02]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-white/[0.06]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      {col.label ?? col.key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-100/80 last:border-0 dark:border-white/[0.03]"
                  >
                    {columns.map((col) => {
                      const cellValue = row[col.key];
                      const display =
                        typeof cellValue === "number"
                          ? formatNumber(cellValue)
                          : String(cellValue ?? "");
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-2 tabular-nums text-gray-700 dark:text-gray-300"
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
  },
});

// ---------------------------------------------------------------------------
// Fallback component
// ---------------------------------------------------------------------------

// Reason: Shown when the LLM emits a component type not in the registry.
function Web3JsonRenderFallback({
  element,
  children,
}: {
  element: { type: string };
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-400 dark:bg-white/[0.04]">
      <p>Unknown component: {element.type}</p>
      {children}
    </div>
  );
}

export { web3InsightRegistry, Web3JsonRenderFallback };

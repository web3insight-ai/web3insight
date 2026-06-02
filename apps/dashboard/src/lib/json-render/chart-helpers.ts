import { composedCurveTypes, composedSeriesTypes } from "./catalog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CHART_COLORS = [
  "#0d9488",
  "#14b8a6",
  "#10b981",
  "#059669",
  "#0f766e",
  "#115e59",
];

// Reason: Recharts tooltips render as HTML, so CSS theme vars resolve at paint
// time and follow the dashboard's light/dark theme instead of being locked to
// light colors. (SVG axis/grid colors cannot use var() and use resolved values
// from getRechartsDefaults() instead.)
export const TOOLTIP_STYLE = {
  backgroundColor: "var(--bg-raised)",
  border: "1px solid var(--rule)",
  borderRadius: "8px",
  color: "var(--fg)",
  fontSize: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComposedSeriesConfig {
  type: string;
  dataKey: string;
  yKey?: string | null;
  name?: string | null;
  color?: string | null;
  curveType?: string | null;
  barSize?: number | null;
  stackId?: string | null;
  strokeWidth?: number | null;
  fillOpacity?: number | null;
  dot?: boolean | null;
}

export interface NormalizedComposedSeriesConfig {
  type: "bar" | "line" | "area" | "scatter";
  dataKey: string;
  name: string;
  color: string;
  curveType: "monotone" | "linear" | "step" | "natural" | "basis";
  barSize?: number;
  stackId?: string;
  strokeWidth: number;
  fillOpacity: number;
  dot: boolean;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

// Reason: Backend API can return values as string | number; this coerces
// safely so chart components always receive numeric values.
export function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return value.toLocaleString();
}

// Reason: The LLM may emit data as a non-array (single object or $state ref
// that resolved to something unexpected). Normalizing avoids runtime crashes.
export function normalizeChartRows(
  data: unknown,
): Array<Record<string, unknown>> {
  if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
  if (data && typeof data === "object")
    return [data as Record<string, unknown>];
  return [];
}

// Reason: Parse YYYY-MM / YYYY-MM-DD as a UTC timestamp with range validation,
// falling back to Date.parse for other formats. Returns null when not a date.
function parseDateValue(value: unknown): number | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = isoMatch[3] ? Number(isoMatch[3]) : 1;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return Date.UTC(year, month - 1, day);
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

// Reason: Reorder x-axis entries chronologically only when EVERY value parses
// as a date; otherwise preserve the original order. Sniffing just the first
// entry (old behavior) could reorder a partially date-like series incorrectly.
function orderEntriesByDateIfPossible(
  entries: Array<Record<string, unknown>>,
  xKey: string,
): Array<Record<string, unknown>> {
  const timestamps = entries.map((entry) => parseDateValue(entry[xKey]));
  if (timestamps.some((ts) => ts === null)) return entries;

  return entries
    .map((entry, index) => ({ entry, ts: timestamps[index] as number }))
    .sort((a, b) => a.ts - b.ts)
    .map((item) => item.entry);
}

function isComposedSeriesType(
  type: string,
): type is (typeof composedSeriesTypes)[number] {
  return (composedSeriesTypes as readonly string[]).includes(type);
}

function isComposedCurveType(
  curveType: string,
): curveType is (typeof composedCurveTypes)[number] {
  return (composedCurveTypes as readonly string[]).includes(curveType);
}

export function normalizeComposedSeries(
  series: ComposedSeriesConfig[],
): NormalizedComposedSeriesConfig[] {
  return series
    .filter((s) => isComposedSeriesType(s.type))
    .map((s, i) => ({
      type: s.type as NormalizedComposedSeriesConfig["type"],
      dataKey: s.dataKey,
      name: s.name ?? s.dataKey,
      color: s.color ?? CHART_COLORS[i % CHART_COLORS.length],
      curveType:
        s.curveType && isComposedCurveType(s.curveType)
          ? s.curveType
          : "monotone",
      barSize: s.barSize ?? undefined,
      stackId: s.stackId ?? undefined,
      strokeWidth: s.strokeWidth ?? 2,
      fillOpacity: s.fillOpacity ?? 0.3,
      dot: s.dot ?? false,
    }));
}

// Reason: Aggregation collapses rows sharing the same xKey value into a
// single point. "sum" adds, "count" counts, "avg" averages.
export function processChartData(
  rows: Array<Record<string, unknown>>,
  xKey: string,
  yKey: string,
  aggregate: string | null | undefined,
): Array<Record<string, unknown>> {
  const normalized = normalizeChartRows(rows);
  if (!aggregate) {
    return orderEntriesByDateIfPossible(
      normalized.map((r) => ({
        ...r,
        [yKey]: toNumber(r[yKey]) ?? 0,
      })),
      xKey,
    );
  }

  const groups = new Map<
    string,
    { sum: number; count: number; xVal: unknown }
  >();
  for (const row of normalized) {
    const key = String(row[xKey] ?? "");
    const existing = groups.get(key) ?? { sum: 0, count: 0, xVal: row[xKey] };
    existing.sum += toNumber(row[yKey]) ?? 0;
    existing.count += 1;
    groups.set(key, existing);
  }

  const result = Array.from(groups.entries()).map(([key, g]) => {
    let value = 0;
    if (aggregate === "sum") value = g.sum;
    else if (aggregate === "count") value = g.count;
    else if (aggregate === "avg") value = g.count > 0 ? g.sum / g.count : 0;
    return { [xKey]: g.xVal ?? key, [yKey]: value };
  });

  return orderEntriesByDateIfPossible(result, xKey);
}

export function processComposedChartData(
  rows: Array<Record<string, unknown>>,
  xKey: string,
  series: NormalizedComposedSeriesConfig[],
  aggregate: string | null | undefined,
): Array<Record<string, unknown>> {
  const normalized = normalizeChartRows(rows);
  if (!aggregate) {
    return orderEntriesByDateIfPossible(
      normalized.map((r) => {
        const out: Record<string, unknown> = { [xKey]: r[xKey] };
        for (const s of series) {
          out[s.dataKey] = toNumber(r[s.dataKey]) ?? 0;
        }
        return out;
      }),
      xKey,
    );
  }

  const groups = new Map<
    string,
    {
      sums: Record<string, number>;
      counts: Record<string, number>;
      xVal: unknown;
    }
  >();
  for (const row of normalized) {
    const key = String(row[xKey] ?? "");
    const existing = groups.get(key) ?? {
      sums: {},
      counts: {},
      xVal: row[xKey],
    };
    for (const s of series) {
      existing.sums[s.dataKey] =
        (existing.sums[s.dataKey] ?? 0) + (toNumber(row[s.dataKey]) ?? 0);
      existing.counts[s.dataKey] = (existing.counts[s.dataKey] ?? 0) + 1;
    }
    groups.set(key, existing);
  }

  const result = Array.from(groups.entries()).map(([key, g]) => {
    const out: Record<string, unknown> = { [xKey]: g.xVal ?? key };
    for (const s of series) {
      if (aggregate === "sum") out[s.dataKey] = g.sums[s.dataKey] ?? 0;
      else if (aggregate === "count") out[s.dataKey] = g.counts[s.dataKey] ?? 0;
      else if (aggregate === "avg") {
        const c = g.counts[s.dataKey] ?? 0;
        out[s.dataKey] = c > 0 ? (g.sums[s.dataKey] ?? 0) / c : 0;
      }
    }
    return out;
  });

  return orderEntriesByDateIfPossible(result, xKey);
}

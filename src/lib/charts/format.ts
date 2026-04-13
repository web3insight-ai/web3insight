const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFmt = new Intl.NumberFormat("en-US");

export function formatCompact(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return compactFmt.format(value);
}

export function formatFull(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return fullFmt.format(value);
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDelta(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "" : "±";
  return `${sign}${fullFmt.format(Math.round(value))}`;
}

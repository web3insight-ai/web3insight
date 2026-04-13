import { cn } from "@/lib/utils";

type Format = "compact" | "full" | "percent" | "delta";

interface NumericCellProps {
  value: number | null | undefined;
  format?: Format;
  decimals?: number;
  className?: string;
  muted?: boolean;
}

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat("en-US");

function formatValue(value: number, format: Format, decimals: number): string {
  switch (format) {
  case "compact":
    return compactFormatter.format(value);
  case "percent":
    return `${(value * 100).toFixed(decimals)}%`;
  case "delta": {
    const sign = value > 0 ? "+" : value < 0 ? "" : "±";
    return `${sign}${fullFormatter.format(Math.round(value))}`;
  }
  case "full":
  default:
    return fullFormatter.format(
      decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value),
    );
  }
}

export function NumericCell({
  value,
  format = "full",
  decimals = 0,
  className,
  muted = false,
}: NumericCellProps) {
  if (value == null || Number.isNaN(value)) {
    return (
      <span className={cn("font-mono tabular-nums text-fg-subtle", className)}>
        —
      </span>
    );
  }

  const tone =
    format === "delta" && value !== 0
      ? value > 0
        ? "text-accent"
        : "text-warn"
      : muted
        ? "text-fg-muted"
        : "text-fg";

  return (
    <span className={cn("font-mono tabular-nums", tone, className)}>
      {formatValue(value, format, decimals)}
    </span>
  );
}

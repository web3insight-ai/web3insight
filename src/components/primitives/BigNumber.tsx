import { cn } from "@/lib/utils";
import { SmallCapsLabel } from "./SmallCapsLabel";
import { NumericCell } from "./NumericCell";

interface BigNumberProps {
  label: string;
  value: number | null | undefined;
  format?: "compact" | "full" | "percent";
  delta?: number;
  deltaLabel?: string;
  footnote?: React.ReactNode;
  size?: "hero" | "default";
  className?: string;
}

export function BigNumber({
  label,
  value,
  format = "compact",
  delta,
  deltaLabel,
  footnote,
  size = "default",
  className,
}: BigNumberProps) {
  const numeric =
    size === "hero"
      ? "text-[clamp(2.75rem,5vw,4rem)] leading-[0.95]"
      : "text-[2rem] leading-[1]";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <SmallCapsLabel>{label}</SmallCapsLabel>
      <div className="flex items-baseline gap-3">
        <span
          className={cn(
            "font-display font-semibold tabular-nums tracking-[-0.02em] text-fg",
            numeric,
          )}
        >
          {value == null || Number.isNaN(value) ? (
            "—"
          ) : (
            <NumericCellInline value={value} format={format} />
          )}
        </span>
        {delta !== undefined && (
          <NumericCell
            value={delta}
            format="delta"
            className="text-[0.875rem]"
          />
        )}
        {deltaLabel && (
          <span className="text-[0.75rem] uppercase tracking-[0.14em] text-fg-subtle">
            {deltaLabel}
          </span>
        )}
      </div>
      {footnote && (
        <p className="text-[0.75rem] leading-[1.45] text-fg-subtle">
          {footnote}
        </p>
      )}
    </div>
  );
}

function NumericCellInline({
  value,
  format,
}: {
  value: number;
  format: "compact" | "full" | "percent";
}) {
  if (format === "compact")
    return (
      <>
        {new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value)}
      </>
    );
  if (format === "percent") return <>{(value * 100).toFixed(1)}%</>;
  return <>{new Intl.NumberFormat("en-US").format(value)}</>;
}

import * as React from "react";
import { cn } from "@/lib/utils";

type Ground = "plain" | "dotted" | "hatched";
type LabelPosition = "tl" | "tr" | "bl" | "br";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  ground?: Ground;
  label?: { text: string; position?: LabelPosition };
  code?: string;
  as?: keyof React.JSX.IntrinsicElements;
  hairline?: "solid" | "soft";
  /**
   * Classes for the inner content wrapper. Use this — not `className` — when
   * a Panel needs `overflow-hidden` to clip tables or inner chrome, so the
   * corner label/code are never cut off by the outer container's bounds.
   */
  innerClassName?: string;
};

const labelPositionClass: Record<LabelPosition, string> = {
  tl: "top-0 left-0 -translate-y-1/2 translate-x-3",
  tr: "top-0 right-0 -translate-y-1/2 -translate-x-3",
  bl: "bottom-0 left-0 translate-y-1/2 translate-x-3",
  br: "bottom-0 right-0 translate-y-1/2 -translate-x-3",
};

export function Panel({
  ground = "plain",
  label,
  code,
  as = "div",
  hairline = "solid",
  className,
  innerClassName,
  children,
  ...rest
}: PanelProps) {
  const Comp = as as React.ElementType;
  const position = label?.position ?? "tl";
  const borderColor =
    hairline === "soft" ? "border-rule" : "border-rule-strong";

  // Reason: some callers pass `overflow-hidden` via className to clip inner
  // tables. That also clips the corner label/code which sit half outside the
  // border via -translate-y-1/2 — moving overflow behaviour to the inner
  // wrapper preserves the corner chrome while still clipping content.
  const classNameStr = typeof className === "string" ? className : "";
  const hoistOverflow = classNameStr.includes("overflow-hidden");
  const outerClassName = hoistOverflow
    ? classNameStr.replace(/\boverflow-hidden\b/g, "").trim()
    : classNameStr;
  const innerWrapperClasses = cn(
    "relative rounded-[inherit]",
    hoistOverflow && "overflow-hidden",
    innerClassName,
  );

  return (
    <Comp
      className={cn(
        "relative border bg-bg-raised rounded-[2px]",
        borderColor,
        outerClassName,
      )}
      {...rest}
    >
      {ground !== "plain" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] text-rule/60",
            ground === "dotted" && "dotted-pattern",
            ground === "hatched" && "diagonal-lines",
          )}
        />
      )}
      {label && (
        <span
          className={cn(
            "absolute z-20 bg-bg px-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-fg-muted whitespace-nowrap",
            labelPositionClass[position],
          )}
        >
          {label.text}
        </span>
      )}
      {code && (
        <span
          className={cn(
            "absolute z-20 bg-bg px-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-fg/70 whitespace-nowrap",
            labelPositionClass[label?.position === "tl" ? "tr" : "tl"],
          )}
        >
          {code}
        </span>
      )}
      <div className={innerWrapperClasses}>{children}</div>
    </Comp>
  );
}

import * as React from "react"
import { cn } from "@/lib/utils"

type Ground = "plain" | "dotted" | "hatched"
type LabelPosition = "tl" | "tr" | "bl" | "br"

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  ground?: Ground
  label?: { text: string; position?: LabelPosition }
  code?: string
  as?: keyof React.JSX.IntrinsicElements
  hairline?: "solid" | "soft"
}

const labelPositionClass: Record<LabelPosition, string> = {
  tl: "top-0 left-0 -translate-y-1/2 translate-x-3",
  tr: "top-0 right-0 -translate-y-1/2 -translate-x-3",
  bl: "bottom-0 left-0 translate-y-1/2 translate-x-3",
  br: "bottom-0 right-0 translate-y-1/2 -translate-x-3",
}

export function Panel({
  ground = "plain",
  label,
  code,
  as = "div",
  hairline = "solid",
  className,
  children,
  ...rest
}: PanelProps) {
  const Comp = as as React.ElementType
  const position = label?.position ?? "tl"
  const borderColor = hairline === "soft" ? "border-border-soft" : "border-border"
  return (
    <Comp
      className={cn(
        "relative border bg-card",
        borderColor,
        "rounded-[2px]",
        className,
      )}
      {...rest}
    >
      {ground !== "plain" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] text-border-soft/60",
            ground === "dotted" && "dotted-pattern",
            ground === "hatched" && "diagonal-lines",
          )}
        />
      )}
      {label && (
        <span
          className={cn(
            "absolute z-10 bg-background px-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-muted-foreground",
            labelPositionClass[position],
          )}
        >
          {label.text}
        </span>
      )}
      {code && (
        <span
          className={cn(
            "absolute z-10 bg-background px-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/70",
            labelPositionClass[label?.position === "tl" ? "tr" : "tl"],
          )}
        >
          {code}
        </span>
      )}
      <div className="relative">{children}</div>
    </Comp>
  )
}

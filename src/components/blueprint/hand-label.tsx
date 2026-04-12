import * as React from "react"
import { cn } from "@/lib/utils"

type HandLabelProps = {
  children: string
  slant?: number
  arrow?: "left" | "right" | "none"
  className?: string
}

export function HandLabel({
  children,
  slant = -6,
  arrow = "right",
  className,
}: HandLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-foreground/80",
        "font-[family-name:var(--font-label)] text-2xl leading-none",
        className,
      )}
      style={{ transform: `rotate(${slant}deg)` }}
    >
      {arrow === "left" && <span aria-hidden>←</span>}
      <span>{children}</span>
      {arrow === "right" && <span aria-hidden>→</span>}
    </span>
  )
}

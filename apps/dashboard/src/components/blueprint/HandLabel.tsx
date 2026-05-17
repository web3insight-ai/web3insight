import * as React from "react";
import { cn } from "@/lib/utils";

type HandLabelProps = {
  children: string;
  slant?: number;
  arrow?: "left" | "right" | "none";
  className?: string;
};

/**
 * Script callout (Caveat) with ± slant and an optional directional arrow.
 * Use sparingly — never in data-dense regions.
 *
 * Requires Caveat font to be wired as --font-caveat in layout.tsx. Falls back
 * to italic system cursive where the font is not yet loaded.
 */
export function HandLabel({
  children,
  slant = -6,
  arrow = "right",
  className,
}: HandLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-fg/80 italic",
        "font-[family-name:var(--font-caveat)] text-2xl leading-none",
        className,
      )}
      style={{ transform: `rotate(${slant}deg)` }}
    >
      {arrow === "left" && <span aria-hidden>←</span>}
      <span>{children}</span>
      {arrow === "right" && <span aria-hidden>→</span>}
    </span>
  );
}

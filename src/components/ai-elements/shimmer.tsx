"use client";

import type { ElementType } from "react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export interface ShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
}

/**
 * Editorial reading indicator used while AI output streams.
 * Replaces the previous gradient-text shimmer (banned). Applies an opacity
 * pulse that respects prefers-reduced-motion via globals.css.
 */
function ShimmerComponent({
  children,
  as: Component = "p",
  className,
}: ShimmerProps) {
  return (
    <Component
      className={cn(
        "inline-block text-fg-muted animate-editorial-pulse",
        className,
      )}
    >
      {children}
    </Component>
  );
}

export const Shimmer = memo(ShimmerComponent);

"use client";

import { cn } from "@/lib/utils";

// Reason: Animated placeholder shown via Suspense while a chart renderer
// lazy-loads. Keeps layout stable and signals that content is coming.
export function ChartLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-2 w-full max-w-[600px] animate-pulse rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-border-dark/60 dark:bg-surface-dark/30",
        className,
      )}
    >
      <div className="mb-3 h-4 w-40 rounded bg-muted/40 dark:bg-muted/20" />
      <div className="h-[200px] w-full rounded-lg bg-muted/30 dark:bg-muted/15" />
    </div>
  );
}

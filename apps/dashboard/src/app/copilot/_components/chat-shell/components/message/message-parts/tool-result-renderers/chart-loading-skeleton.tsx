"use client";

import { cn } from "@/lib/utils";

// Reason: Animated placeholder shown via Suspense while a chart renderer
// lazy-loads. Keeps layout stable and signals that content is coming.
export function ChartLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-2 w-full max-w-[600px] animate-pulse rounded-[2px] border border-rule bg-bg-sunken p-4",
        className,
      )}
    >
      <div className="mb-3 h-4 w-40 rounded-[2px] bg-bg-raised" />
      <div className="h-[200px] w-full rounded-[2px] bg-bg-raised" />
    </div>
  );
}

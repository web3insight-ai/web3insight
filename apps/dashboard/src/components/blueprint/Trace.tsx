import * as React from "react";
import { cn } from "@/lib/utils";

type TraceProps = {
  className?: string;
  d?: string;
  viewBox?: string;
  preserveAspectRatio?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
  length?: number;
  nodes?: Array<{ x: number; y: number; filled?: boolean }>;
  color?: "teal" | "ink" | "soft";
};

const colorClass: Record<NonNullable<TraceProps["color"]>, string> = {
  teal: "text-accent",
  ink: "text-fg",
  soft: "text-rule",
};

export function Trace({
  className,
  d,
  viewBox = "0 0 100 100",
  preserveAspectRatio = "none",
  strokeWidth = 1,
  delay = 0.2,
  duration = 1.6,
  length = 600,
  nodes = [],
  color = "teal",
}: TraceProps) {
  const nodeDelay = delay + duration * 0.8;
  return (
    <svg
      className={cn(
        "pointer-events-none absolute",
        colorClass[color],
        className,
      )}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {d && (
        <path
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          className="animate-draw"
          style={
            {
              "--draw-length": length,
              "--draw-delay": `${delay}s`,
              "--draw-duration": `${duration}s`,
            } as React.CSSProperties
          }
        />
      )}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={1.8}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill={n.filled === false ? "var(--bg)" : "currentColor"}
          className="animate-fade-in-up"
          style={{ animationDelay: `${nodeDelay + i * 0.08}s`, opacity: 0 }}
        />
      ))}
    </svg>
  );
}

export function buildOrthogonalPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bendAt: "x" | "y" = "x",
): string {
  if (bendAt === "x") {
    return `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`;
  }
  return `M ${from.x} ${from.y} L ${from.x} ${to.y} L ${to.x} ${to.y}`;
}

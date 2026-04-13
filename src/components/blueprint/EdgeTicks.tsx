import * as React from "react";
import { cn } from "@/lib/utils";

type Side = "left" | "right" | "top" | "bottom";

type EdgeTicksProps = {
  sides?: Side[];
  every?: number;
  length?: number;
  className?: string;
};

export function EdgeTicks({
  sides = ["left", "right"],
  every = 40,
  length = 6,
  className,
}: EdgeTicksProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden text-rule/70",
        className,
      )}
    >
      {sides.map((side) => (
        <TickStrip key={side} side={side} every={every} length={length} />
      ))}
    </div>
  );
}

function TickStrip({
  side,
  every,
  length,
}: {
  side: Side;
  every: number;
  length: number;
}) {
  const isVertical = side === "left" || side === "right";
  const axis = isVertical ? "to bottom" : "to right";
  const gradient = `repeating-linear-gradient(${axis}, currentColor 0 1px, transparent 1px ${every}px)`;
  const style: React.CSSProperties = { backgroundImage: gradient };
  if (side === "left") {
    style.top = 0;
    style.bottom = 0;
    style.left = 0;
    style.width = `${length}px`;
  } else if (side === "right") {
    style.top = 0;
    style.bottom = 0;
    style.right = 0;
    style.width = `${length}px`;
  } else if (side === "top") {
    style.top = 0;
    style.left = 0;
    style.right = 0;
    style.height = `${length}px`;
  } else {
    style.bottom = 0;
    style.left = 0;
    style.right = 0;
    style.height = `${length}px`;
  }
  return <div className="absolute" style={style} />;
}

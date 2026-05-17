import * as React from "react"
import { cn } from "@/lib/utils"

type LogoMarkProps = {
  size?: number
  className?: string
}

/**
 * 3×3 grid-of-squares mark. Center square rendered in teal; all others are
 * hairline ink outlines. Reads as a schematic / PCB chip emblem.
 */
export function LogoMark({ size = 22, className }: LogoMarkProps) {
  const cells = Array.from({ length: 9 }, (_, i) => i)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-foreground shrink-0", className)}
      aria-hidden
    >
      {cells.map((i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = col * 7 + 0.5
        const y = row * 7 + 0.5
        const isCenter = i === 4
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={6}
            height={6}
            stroke="currentColor"
            strokeWidth={1}
            fill={isCenter ? "var(--teal-500)" : "transparent"}
          />
        )
      })}
    </svg>
  )
}

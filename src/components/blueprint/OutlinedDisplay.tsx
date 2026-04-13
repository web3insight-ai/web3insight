import * as React from "react";
import { cn } from "@/lib/utils";

type OutlinedDisplayProps = {
  children: string;
  stack?: number;
  offset?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  solidFront?: boolean;
};

/**
 * Layered outline-stroke echoes under a solid front layer. Used for hero
 * wordmarks and editorial display runs. Front layer reads the accessible text;
 * echoes are aria-hidden.
 */
export function OutlinedDisplay({
  children,
  stack = 5,
  offset = 6,
  className,
  as = "span",
  solidFront = true,
}: OutlinedDisplayProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp className={cn("relative inline-block leading-none", className)}>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="relative block">
        {Array.from({ length: stack }).map((_, i) => {
          const top = (stack - 1 - i) * offset;
          return (
            <span
              key={i}
              className="absolute inset-x-0 block"
              style={{
                top: `${top}px`,
                color: "transparent",
                WebkitTextStroke: "1px var(--fg)",
              }}
            >
              {children}
            </span>
          );
        })}
        <span
          className="relative block"
          style={{
            top: `${stack * offset}px`,
            color: solidFront ? "var(--fg)" : "transparent",
            WebkitTextStroke: solidFront ? undefined : "1px var(--fg)",
          }}
        >
          {children}
        </span>
      </span>
    </Comp>
  );
}

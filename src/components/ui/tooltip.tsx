"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { type ReactNode } from "react";
import clsx from "clsx";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  closeDelay?: number;
  classNames?: {
    base?: string;
    content?: string;
    arrow?: string;
  };
}

function Tooltip({
  content,
  children,
  placement = "top",
  delay = 300,
  classNames,
}: TooltipProps) {
  return (
    <BaseTooltip.Provider delay={delay} closeDelay={0}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger className="inline-flex" render={<span />}>
          {children}
        </BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={placement} sideOffset={6}>
            <BaseTooltip.Popup
              className={clsx(
                "z-50 max-w-xs rounded-lg px-3 py-2 text-xs leading-relaxed shadow-lg",
                "bg-white dark:bg-surface-elevated text-gray-900 dark:text-gray-100",
                "border border-gray-200 dark:border-border-dark",
                "animate-fade-in",
                classNames?.content,
              )}
            >
              {content}
              <BaseTooltip.Arrow
                className={clsx(
                  "fill-white dark:fill-surface-elevated",
                  "[&>path]:stroke-gray-200 dark:[&>path]:stroke-border-dark",
                  classNames?.arrow,
                )}
              />
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}

export { Tooltip };
export type { TooltipProps };

"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { type ReactNode } from "react";
import clsx from "clsx";

type PopoverSide = "top" | "bottom" | "left" | "right";
type PopoverAlign = "start" | "center" | "end";

interface PopoverProps {
  children: ReactNode;
  placement?:
    | "top"
    | "bottom"
    | "bottom-end"
    | "bottom-start"
    | "left"
    | "right";
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: number;
}

function Popover({ children, isOpen, onOpenChange }: PopoverProps) {
  return (
    <BasePopover.Root open={isOpen} onOpenChange={onOpenChange}>
      {children}
    </BasePopover.Root>
  );
}

function PopoverTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BasePopover.Trigger className={clsx("inline-flex", className)}>
      {children}
    </BasePopover.Trigger>
  );
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  side?: PopoverSide;
  align?: PopoverAlign;
  sideOffset?: number;
}

function PopoverContent({
  children,
  className,
  style,
  side = "bottom",
  align = "center",
  sideOffset = 8,
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-[100]"
      >
        <BasePopover.Popup
          className={clsx(
            "rounded-xl bg-white dark:bg-surface-dark",
            "shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
            "border border-gray-200 dark:border-gray-700",
            "outline-none",
            className,
          )}
          style={style}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
export type { PopoverProps, PopoverContentProps };

"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import { type ReactNode } from "react";
import clsx from "clsx";

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

function Popover({
  children,
  placement: _placement = "bottom",
  isOpen,
  onOpenChange,
  offset: _offset = 8,
}: PopoverProps) {
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
}

function PopoverContent({ children, className, style }: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner sideOffset={8}>
        <BasePopover.Popup
          className={clsx(
            "z-50 rounded-lg bg-white dark:bg-surface-dark shadow-lg",
            "border border-border dark:border-border-dark",
            "animate-scale-in",
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

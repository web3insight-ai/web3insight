"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { type ReactNode } from "react";
import clsx from "clsx";

function Dropdown({ children }: { children: ReactNode }) {
  return <BaseMenu.Root>{children}</BaseMenu.Root>;
}

function DropdownTrigger({ children }: { children: ReactNode }) {
  return (
    <BaseMenu.Trigger className="inline-flex">{children}</BaseMenu.Trigger>
  );
}

interface DropdownMenuProps {
  children: ReactNode;
  "aria-label"?: string;
}

function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={8}>
        <BaseMenu.Popup
          className="z-50 min-w-[180px] rounded-lg bg-white dark:bg-surface-dark shadow-lg border border-border dark:border-border-dark p-1 animate-scale-in"
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  key?: string;
  onClick?: () => void;
  className?: string;
}

function DropdownItem({ children, onClick, className }: DropdownItemProps) {
  return (
    <BaseMenu.Item
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
        "text-gray-700 dark:text-gray-300 cursor-pointer",
        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        "outline-none focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </BaseMenu.Item>
  );
}

export { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem };

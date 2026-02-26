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
          className="z-[100] min-w-[180px] rounded-xl bg-white dark:bg-surface-dark shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-gray-700 p-1.5 animate-scale-in"
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
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]",
        "text-gray-700 dark:text-gray-300 cursor-pointer",
        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150",
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

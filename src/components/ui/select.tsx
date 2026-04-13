"use client";

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectItemProps {
  key: string;
  children: ReactNode;
  value?: string;
}

function SelectItem({ children, ...props }: SelectItemProps) {
  return <option {...props}>{children}</option>;
}

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered";
  selectedKeys?: Set<string> | string[];
  onSelectionChange?: (keys: Set<string>) => void;
  children?: ReactNode;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 text-xs",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      size = "md",
      variant = "flat",
      selectedKeys,
      onSelectionChange,
      children,
      ...props
    },
    ref,
  ) => {
    const selectedValue = selectedKeys
      ? selectedKeys instanceof Set
        ? Array.from(selectedKeys)[0]
        : selectedKeys[0]
      : undefined;

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label className="text-xs font-medium text-fg-muted">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={selectedValue}
            onChange={(e) => {
              onSelectionChange?.(new Set([e.target.value]));
            }}
            className={clsx(
              "w-full appearance-none rounded-[2px] pr-8 pl-3 outline-none transition-colors duration-200",
              "text-fg",
              variant === "flat" &&
                "bg-bg-raised hover:bg-bg-sunken focus:ring-1 focus:ring-accent",
              variant === "bordered" &&
                "border border-rule bg-transparent hover:border-rule-strong focus:border-accent",
              sizeClasses[size],
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
          />
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select, SelectItem };
export type { SelectProps, SelectItemProps };

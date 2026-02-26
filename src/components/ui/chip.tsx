import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "solid" | "flat" | "bordered" | "dot";
  size?: "sm" | "md" | "lg";
  startContent?: ReactNode;
  endContent?: ReactNode;
}

const colorMap: Record<string, Record<string, string>> = {
  solid: {
    default: "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
  },
  flat: {
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  },
  bordered: {
    default:
      "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300",
    primary: "border border-primary text-primary",
  },
};

const sizeMap: Record<string, string> = {
  sm: "px-1.5 py-0.5 text-[10px] h-5",
  md: "px-2 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

function Chip({
  className,
  children,
  color = "default",
  variant = "flat",
  size = "md",
  startContent,
  endContent,
  ...props
}: ChipProps) {
  const colorStyle = colorMap[variant]?.[color] || colorMap.flat.default;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        sizeMap[size],
        colorStyle,
        className,
      )}
      {...props}
    >
      {startContent}
      {children}
      {endContent}
    </span>
  );
}

export { Chip };
export type { ChipProps };

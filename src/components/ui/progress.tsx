import clsx from "clsx";

interface ProgressProps {
  value?: number;
  maxValue?: number;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValueLabel?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  default: "bg-gray-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const sizeMap: Record<string, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

function Progress({
  value = 0,
  maxValue = 100,
  color = "primary",
  size = "md",
  label,
  showValueLabel,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={clsx("w-full", className)}>
      {(label || showValueLabel) && (
        <div className="flex justify-between mb-1">
          {label && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {label}
            </span>
          )}
          {showValueLabel && (
            <span className="text-xs text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          "w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden",
          sizeMap[size],
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            colorMap[color],
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        />
      </div>
    </div>
  );
}

export { Progress };
export type { ProgressProps };

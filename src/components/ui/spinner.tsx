import clsx from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "white";
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const colorMap: Record<string, string> = {
  default: "text-gray-400",
  primary: "text-primary",
  white: "text-white",
};

function Spinner({ size = "md", color = "primary", className }: SpinnerProps) {
  return (
    <svg
      className={clsx(
        "animate-spin",
        sizeMap[size],
        colorMap[color],
        className,
      )}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export { Spinner };
export type { SpinnerProps };

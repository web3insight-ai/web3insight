import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "solid" | "bordered" | "light" | "flat" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  onPress?: () => void;
}

const colorVariants: Record<string, Record<string, string>> = {
  solid: {
    default:
      "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600",
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    success: "bg-success text-white hover:bg-success/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    danger: "bg-danger text-white hover:bg-danger/90",
  },
  flat: {
    default:
      "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    success: "bg-success/10 text-success hover:bg-success/20",
    warning: "bg-warning/10 text-warning hover:bg-warning/20",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
  },
  light: {
    default:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    primary: "text-primary hover:bg-primary/10",
    secondary: "text-secondary hover:bg-secondary/10",
    success: "text-success hover:bg-success/10",
    warning: "text-warning hover:bg-warning/10",
    danger: "text-danger hover:bg-danger/10",
  },
  bordered: {
    default:
      "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
    primary: "border border-primary text-primary hover:bg-primary/10",
    danger: "border border-danger text-danger hover:bg-danger/10",
  },
  ghost: {
    default:
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
    primary: "text-primary hover:bg-primary/10",
    danger: "text-danger hover:bg-danger/10",
  },
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      color = "default",
      variant = "solid",
      size = "md",
      isLoading,
      isDisabled,
      fullWidth,
      startContent,
      endContent,
      onPress,
      onClick,
      ...props
    },
    ref,
  ) => {
    const variantStyles =
      colorVariants[variant]?.[color] || colorVariants.solid.default;

    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.97]",
          sizeClasses[size],
          variantStyles,
          fullWidth && "w-full",
          className,
        )}
        disabled={isDisabled || isLoading}
        onClick={onPress || onClick}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
        )}
        {!isLoading && startContent}
        {children}
        {endContent}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };

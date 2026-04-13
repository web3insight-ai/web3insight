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
    default: "bg-rule text-fg hover:bg-rule",
    primary: "bg-accent text-accent-fg hover:brightness-105",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    success: "bg-success text-white hover:bg-success/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    danger: "bg-danger text-white hover:bg-danger/90",
  },
  flat: {
    default: "bg-bg-raised text-fg hover:bg-bg-sunken",
    primary: "bg-accent-subtle text-accent hover:bg-accent-muted",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    success: "bg-success/10 text-success hover:bg-success/20",
    warning: "bg-warning/10 text-warning hover:bg-warning/20",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
  },
  light: {
    default: "text-fg hover:bg-bg-sunken",
    primary: "text-accent hover:bg-accent-subtle",
    secondary: "text-secondary hover:bg-secondary/10",
    success: "text-success hover:bg-success/10",
    warning: "text-warning hover:bg-warning/10",
    danger: "text-danger hover:bg-danger/10",
  },
  bordered: {
    default: "border border-rule text-fg hover:bg-bg-sunken",
    primary: "border border-accent text-accent hover:bg-accent-subtle",
    danger: "border border-danger text-danger hover:bg-danger/10",
  },
  ghost: {
    default: "text-fg hover:bg-bg-sunken",
    primary: "text-accent hover:bg-accent-subtle",
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
          "inline-flex items-center justify-center font-medium rounded-[2px] transition-colors duration-200",
          "focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent",
          "disabled:opacity-60 disabled:saturate-50 disabled:cursor-not-allowed",
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

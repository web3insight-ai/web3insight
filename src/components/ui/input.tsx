import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "underlined";
  isInvalid?: boolean;
  errorMessage?: string;
  description?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      startContent,
      endContent,
      size = "md",
      variant = "flat",
      isInvalid,
      errorMessage,
      description,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            {label}
          </label>
        )}
        <div
          className={clsx(
            "flex items-center gap-2 rounded-lg transition-colors duration-200",
            variant === "flat" &&
              "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
            variant === "bordered" &&
              "border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
            variant === "underlined" &&
              "border-b border-gray-300 dark:border-gray-600 rounded-none",
            "focus-within:ring-2 focus-within:ring-primary/40",
            isInvalid && "ring-2 ring-danger/40",
            sizeClasses[size],
          )}
        >
          {startContent && (
            <span className="flex-shrink-0 text-gray-400">{startContent}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0"
            {...props}
          />
          {endContent && (
            <span className="flex-shrink-0 text-gray-400">{endContent}</span>
          )}
        </div>
        {description && !isInvalid && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        {isInvalid && errorMessage && (
          <p className="text-xs text-danger">{errorMessage}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };

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
            className="text-xs font-medium text-fg-muted"
          >
            {label}
          </label>
        )}
        <div
          className={clsx(
            "flex items-center gap-2 rounded-[2px] transition-colors duration-200",
            variant === "flat" &&
              "bg-bg-raised hover:bg-bg-sunken focus-within:bg-bg-raised focus-within:ring-1 focus-within:ring-accent",
            variant === "bordered" &&
              "border border-rule hover:border-rule-strong focus-within:border-accent",
            variant === "underlined" &&
              "border-b border-rule rounded-none focus-within:border-accent",
            isInvalid && "ring-1 ring-danger",
            sizeClasses[size],
          )}
        >
          {startContent && (
            <span className="flex-shrink-0 text-fg-subtle">{startContent}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="flex-1 bg-transparent outline-none text-fg placeholder:text-fg-subtle dark:placeholder:text-fg-muted min-w-0"
            {...props}
          />
          {endContent && (
            <span className="flex-shrink-0 text-fg-subtle">{endContent}</span>
          )}
        </div>
        {description && !isInvalid && (
          <p className="text-xs text-fg-muted">{description}</p>
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

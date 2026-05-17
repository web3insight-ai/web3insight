import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, isInvalid, errorMessage, id, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={clsx("flex flex-col gap-1.5", className)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-fg-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            "w-full rounded-[2px] px-3 py-2 text-sm outline-none transition-colors duration-200",
            "bg-bg-raised hover:bg-bg-sunken",
            "text-fg placeholder:text-fg-subtle dark:placeholder:text-fg-muted",
            "focus:ring-1 focus:ring-accent focus:border-accent",
            "resize-y min-h-[80px]",
            isInvalid && "ring-2 ring-danger/40",
          )}
          {...props}
        />
        {isInvalid && errorMessage && (
          <p className="text-xs text-danger">{errorMessage}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps };

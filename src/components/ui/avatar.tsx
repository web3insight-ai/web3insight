import { forwardRef, type ImgHTMLAttributes } from "react";
import clsx from "clsx";

interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "size" | "color"
> {
  name?: string;
  size?: "sm" | "md" | "lg";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  isBordered?: boolean;
  as?: "button" | "span" | "div";
}

const sizeClasses: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
};

const colorClasses: Record<string, string> = {
  default: "ring-gray-300 dark:ring-gray-600",
  primary: "ring-primary",
  secondary: "ring-secondary",
  success: "ring-success",
  warning: "ring-warning",
  danger: "ring-danger",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      name,
      alt,
      size = "md",
      color = "default",
      isBordered,
      as: _Component = "span",
      onClick,
      ...props
    },
    ref,
  ) => {
    const initials = name?.charAt(0).toUpperCase() || "?";
    const isButton = _Component === "button" || !!onClick;

    return (
      <div
        ref={ref}
        role={isButton ? "button" : undefined}
        tabIndex={isButton ? 0 : undefined}
        onClick={onClick}
        className={clsx(
          "inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0",
          "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium",
          sizeClasses[size],
          isBordered && `ring-2 ${colorClasses[color]}`,
          isButton && "cursor-pointer hover:opacity-80 transition-opacity",
          className,
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
export type { AvatarProps };

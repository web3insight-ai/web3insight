import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  isHoverable?: boolean;
  isPressable?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark shadow-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx("px-6 py-5", className)} {...props}>
      {children}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx("p-5", className)} {...props}>
      {children}
    </div>
  ),
);
CardBody.displayName = "CardBody";

export { Card, CardHeader, CardBody };
export type { CardProps, CardHeaderProps, CardBodyProps };

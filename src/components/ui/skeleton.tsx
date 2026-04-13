import clsx from "clsx";
import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  isLoaded?: boolean;
}

function Skeleton({ className, children, isLoaded, ...props }: SkeletonProps) {
  if (isLoaded) {
    return <>{children}</>;
  }

  return (
    <div
      className={clsx("loading-skeleton rounded-[2px]", className)}
      {...props}
    >
      {children && <div className="invisible">{children}</div>}
    </div>
  );
}

export { Skeleton };
export type { SkeletonProps };

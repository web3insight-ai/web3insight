import { cn } from "@/lib/utils";

interface AnnotationRailProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Narrow right column used for editorial annotations alongside a chart or
 * table. Sticky at larger breakpoints. Use with a two-column grid like:
 *   grid-cols-1 lg:grid-cols-[1fr_14rem]
 */
export function AnnotationRail({ children, className }: AnnotationRailProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-4 border-l border-rule pl-5 text-[0.8125rem] leading-[1.5] text-fg-muted lg:sticky lg:top-24 lg:self-start",
        className,
      )}
    >
      {children}
    </aside>
  );
}

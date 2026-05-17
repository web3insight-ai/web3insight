import { cn } from "@/lib/utils";
import { SmallCapsLabel } from "./SmallCapsLabel";

interface EmptyStateProps {
  label?: string;
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  label = "nothing to show",
  title,
  hint,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 border border-rule border-dashed rounded-[2px] bg-bg-raised px-6 py-10 max-w-[var(--measure)]",
        className,
      )}
    >
      <SmallCapsLabel tone="subtle">{label}</SmallCapsLabel>
      <p className="text-[1rem] leading-[1.5] text-fg font-display">{title}</p>
      {hint && (
        <p className="text-[0.875rem] leading-[1.5] text-fg-muted">{hint}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

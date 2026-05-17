import { cn } from "@/lib/utils";
import { SmallCapsLabel } from "./SmallCapsLabel";

interface SectionHeaderProps {
  kicker?: string;
  title: React.ReactNode;
  deck?: React.ReactNode;
  action?: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  deck,
  action,
  level = 2,
  className,
}: SectionHeaderProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";

  const sizeClass =
    level === 1
      ? "text-[clamp(2rem,4vw,2.75rem)] leading-[1.05]"
      : level === 2
        ? "text-[1.625rem] leading-[1.15]"
        : "text-[1.25rem] leading-[1.2]";

  return (
    <header
      className={cn(
        "flex items-start justify-between gap-8 border-b border-rule pb-5 mb-6",
        className,
      )}
    >
      <div className="flex flex-col gap-2 max-w-[var(--measure)]">
        {kicker && <SmallCapsLabel tone="accent">{kicker}</SmallCapsLabel>}
        <Heading
          className={cn(
            "font-display font-semibold tracking-[-0.01em] text-fg",
            sizeClass,
          )}
        >
          {title}
        </Heading>
        {deck && (
          <p className="text-[0.9375rem] leading-[1.55] text-fg-muted mt-1">
            {deck}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

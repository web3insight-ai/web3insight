import { cn } from "@/lib/utils";

interface HashProps {
  value: string;
  chars?: number;
  className?: string;
}

export function Hash({ value, chars = 6, className }: HashProps) {
  const truncated =
    value.length > chars * 2 + 2
      ? `${value.slice(0, chars)}…${value.slice(-chars)}`
      : value;

  return (
    <span
      className={cn("font-mono text-[0.8125rem] text-fg-muted", className)}
      title={value}
    >
      {truncated}
    </span>
  );
}

export function RepoSha({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[0.75rem] uppercase tracking-wider text-fg-subtle",
        className,
      )}
      title={value}
    >
      {value.slice(0, 7)}
    </span>
  );
}

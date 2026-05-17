import { cn } from "@/lib/utils";

interface SmallCapsLabelProps {
  children: React.ReactNode;
  as?: "span" | "div" | "p" | "dt";
  tone?: "muted" | "subtle" | "accent";
  className?: string;
}

export function SmallCapsLabel({
  children,
  as: Tag = "span",
  tone = "muted",
  className,
}: SmallCapsLabelProps) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "subtle"
        ? "text-fg-subtle"
        : "text-fg-muted";

  return (
    <Tag
      className={cn(
        "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.14em]",
        toneClass,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

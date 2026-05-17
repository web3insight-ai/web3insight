import { cn } from "@/lib/utils";

interface MetaItem {
  label: string;
  value: React.ReactNode;
}

interface MetaListProps {
  items: MetaItem[];
  className?: string;
}

export function MetaList({ items, className }: MetaListProps) {
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-1 text-[0.75rem] text-fg-muted",
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-baseline gap-1.5">
          <dt className="font-sans uppercase tracking-[0.14em] text-[0.6875rem] text-fg-subtle">
            {item.label}
          </dt>
          <dd className="font-mono tabular-nums text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

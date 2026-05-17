import { cn } from "@/lib/utils";

export interface DenseColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  numeric?: boolean;
  render: (row: T, index: number) => React.ReactNode;
}

interface DenseTableProps<T> {
  columns: DenseColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  className?: string;
  compact?: boolean;
  caption?: React.ReactNode;
}

export function DenseTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  className,
  compact = false,
  caption,
}: DenseTableProps<T>) {
  const rowPad = compact ? "py-1.5" : "py-2.5";

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-[0.875rem]">
        {caption && (
          <caption className="pb-3 text-left text-[0.8125rem] text-fg-muted">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-rule-strong">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "pb-2 pr-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-fg-subtle",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (col.align ?? "left") === "left" && "text-left",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={rowKey(row, i)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-rule transition-colors",
                onRowClick && "cursor-pointer hover:bg-bg-raised",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "pr-4",
                    rowPad,
                    col.numeric && "font-mono tabular-nums",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

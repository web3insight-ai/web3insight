import { Skeleton } from "@/components/ui";

import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

interface TableSkeletonProps {
  title?: string;
  icon?: React.ReactNode;
  rows?: number;
  columns?: number;
  showFooter?: boolean;
}

function TableSkeleton({
  title = "Loading",
  rows = 5,
  columns = 6,
  showFooter = true,
}: TableSkeletonProps) {
  return (
    <Panel
      label={{ text: "loading · table", position: "tl" }}
      className="overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>{title}</SmallCapsLabel>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-rule bg-bg-sunken">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-3 w-full rounded-[2px]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton
                      className={`h-4 rounded-[2px] ${
                        colIndex === 0
                          ? "w-8"
                          : colIndex === 1
                            ? "w-32"
                            : "w-16"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="px-6 py-4 border-t border-rule">
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-[11px] text-fg-muted">
              fetching
            </span>
            <span
              aria-hidden
              className="animate-cursor inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-accent align-middle"
            />
          </div>
        </div>
      )}
    </Panel>
  );
}

export default TableSkeleton;

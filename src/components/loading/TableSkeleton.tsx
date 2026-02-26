import { Card, CardHeader, Skeleton } from "@/components/ui";

interface TableSkeletonProps {
  title?: string;
  icon?: React.ReactNode;
  rows?: number;
  columns?: number;
  showFooter?: boolean;
}

function TableSkeleton({
  title = "Loading...",
  icon,
  rows = 5,
  columns = 6,
  showFooter = true,
}: TableSkeletonProps) {
  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
      <CardHeader className="px-6 py-5">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 rounded-lg bg-primary/10">{icon}</div>}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton className="h-3 w-full rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton
                      className={`h-4 rounded ${
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
        <div className="px-6 py-4 border-t border-border dark:border-border-dark">
          <div className="flex items-center justify-center">
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      )}
    </Card>
  );
}

export default TableSkeleton;

import { Card, CardHeader, CardBody, Skeleton } from "@/components/ui";

interface ChartSkeletonProps {
  title?: string;
  height?: string;
}

function ChartSkeleton({
  title = "Loading Chart...",
  height = "320px",
}: ChartSkeletonProps) {
  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
      <CardHeader className="px-6 py-4 border-b border-border dark:border-border-dark">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </CardHeader>
      <CardBody className="p-6" style={{ height }}>
        <div className="w-full h-full flex items-end justify-between gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex-1 h-full flex items-end">
              <Skeleton
                className="w-full rounded-t"
                style={{
                  height: `${Math.random() * 60 + 40}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default ChartSkeleton;

import { Card, CardBody, Skeleton } from "@nextui-org/react";

function MetricOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
            <CardBody className="p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="flex-shrink-0 w-10 h-10 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default MetricOverviewSkeleton;

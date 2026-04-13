import clsx from "clsx";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@/components/ui";

interface ActivityListSkeletonProps {
  className?: string;
  itemCount?: number;
}

function ActivityListSkeleton({
  className,
  itemCount = 8,
}: ActivityListSkeletonProps) {
  return (
    <Card className={clsx("bg-bg-raised shadow-sm border-none", className)}>
      <CardHeader className="px-6 py-4">
        <Skeleton className="h-6 w-48 rounded-[2px]">
          <div className="h-6 w-48 loading-skeleton rounded-[2px]" />
        </Skeleton>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rule" />
          <div className="space-y-4">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div key={index} className="relative flex items-start gap-4 p-4">
                <Skeleton className="w-8 h-8 rounded-full">
                  <div className="w-8 h-8 loading-skeleton rounded-full" />
                </Skeleton>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full rounded-[2px]">
                    <div className="h-4 w-full loading-skeleton rounded-[2px]" />
                  </Skeleton>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 rounded-[2px]">
                      <div className="h-3 w-24 loading-skeleton rounded-[2px]" />
                    </Skeleton>
                    <Skeleton className="h-3 w-16 rounded-[2px]">
                      <div className="h-3 w-16 loading-skeleton rounded-[2px]" />
                    </Skeleton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ActivityListSkeleton;

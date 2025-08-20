import clsx from "clsx";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@nextui-org/react";

interface ActivityListSkeletonProps {
  className?: string;
  itemCount?: number;
}

function ActivityListSkeleton({ className, itemCount = 8 }: ActivityListSkeletonProps) {
  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none", className)}>
      <CardHeader className="px-6 py-4">
        <Skeleton className="h-6 w-48 rounded-lg">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </Skeleton>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-4">
            {Array.from({ length: itemCount }).map((_, index) => (
              <div key={index} className="relative flex items-start gap-4 p-4">
                <Skeleton className="w-8 h-8 rounded-full">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </Skeleton>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full rounded-lg">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </Skeleton>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 rounded-lg">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </Skeleton>
                    <Skeleton className="h-3 w-16 rounded-lg">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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

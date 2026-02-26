import { Card, CardBody, Skeleton } from "@/components/ui";

interface ProfileHeaderSkeletonProps {
  className?: string;
}

export function ProfileHeaderSkeleton({
  className = "",
}: ProfileHeaderSkeletonProps) {
  return (
    <Card
      className={`bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark ${className}`}
    >
      <CardBody className="p-4 md:p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="rounded-full w-14 h-14" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-6 w-10 rounded" />
              </div>
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <Skeleton className="h-3 w-3/5 rounded" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

import { Card, CardBody, Skeleton } from "@/components/ui";
import { Brain } from "lucide-react";

interface AIInsightsSkeletonProps {
  className?: string;
}

export function AIInsightsSkeleton({
  className = "",
}: AIInsightsSkeletonProps) {
  return (
    <Card
      className={`bg-bg-raised border border-rule rounded-[2px] ${className}`}
    >
      <CardBody className="p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-accent" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        </div>

        <div className="space-y-2 border-l-3 border-l-accent pl-3">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-[90%] rounded" />
          <Skeleton className="h-3 w-[80%] rounded" />
          <Skeleton className="h-3 w-[70%] rounded" />
        </div>
      </CardBody>
    </Card>
  );
}

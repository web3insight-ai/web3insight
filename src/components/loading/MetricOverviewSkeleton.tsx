import { Skeleton } from "@/components/ui";

function MetricOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 py-2">
      <div className="lg:col-span-6 flex flex-col gap-3">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-16 w-48 rounded" />
        <Skeleton className="h-3 w-full max-w-xs rounded mt-2" />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-10">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-9 w-32 rounded" />
          </div>
        ))}
      </div>
      <div className="lg:col-span-3 flex flex-col gap-3">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-9 w-32 rounded" />
        <Skeleton className="h-3 w-full max-w-xs rounded mt-2" />
      </div>
    </div>
  );
}

export default MetricOverviewSkeleton;

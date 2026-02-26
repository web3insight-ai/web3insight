import { Card, Skeleton } from "@/components/ui";

function DeveloperGridSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="relative p-5">
            <div className="animate-pulse">
              <Skeleton className="h-5 w-24 mb-3 rounded" />
              <Skeleton className="h-7 w-16 mb-1 rounded" />
              <Skeleton className="h-3 w-8 mb-3 rounded" />
              <Skeleton className="h-3 w-20 mb-1 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-border dark:border-border-dark">
        <div className="flex items-center justify-center">
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </Card>
  );
}

export default DeveloperGridSkeleton;

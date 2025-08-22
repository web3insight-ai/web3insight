'use client';

function EventAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Metrics Overview Skeleton */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-1 mx-auto" />
              <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Chart Skeleton */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-2">
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="space-y-1">
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Ranking Skeleton */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventAnalyticsSkeleton;

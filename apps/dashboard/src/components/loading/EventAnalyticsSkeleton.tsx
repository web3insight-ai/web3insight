"use client";

function EventAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-3">
          <span className="loading-skeleton w-4 h-4 rounded-[2px]" />
          <span className="loading-skeleton w-24 h-4 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <span className="loading-skeleton block w-12 h-5 rounded-[2px] mb-1 mx-auto" />
              <span className="loading-skeleton block w-16 h-3 rounded-[2px] mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-3">
          <span className="loading-skeleton w-4 h-4 rounded-[2px]" />
          <span className="loading-skeleton w-32 h-4 rounded-[2px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <span className="loading-skeleton block w-full h-40 rounded-[2px]" />
          </div>
          <div className="lg:col-span-2 space-y-2">
            <span className="loading-skeleton block w-full h-12 rounded-[2px]" />
            <div className="space-y-1">
              <span className="loading-skeleton block w-full h-8 rounded-[2px]" />
              <span className="loading-skeleton block w-full h-8 rounded-[2px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-3">
          <span className="loading-skeleton w-4 h-4 rounded-[2px]" />
          <span className="loading-skeleton w-28 h-4 rounded-[2px]" />
          <span className="loading-skeleton w-20 h-3 rounded-[2px] ml-auto" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <span className="loading-skeleton block w-full h-48 rounded-[2px]" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="loading-skeleton block w-full h-10 rounded-[2px]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventAnalyticsSkeleton;

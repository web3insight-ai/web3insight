import { Skeleton } from "@/components/ui";

function DeveloperGridSkeleton() {
  return (
    <div className="border border-rule rounded-[2px] bg-bg-raised">
      <div className="grid grid-cols-1 md:grid-cols-5 divide-x divide-rule border-b border-rule">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="relative p-5">
            <Skeleton className="h-5 w-24 mb-3 rounded-[2px]" />
            <Skeleton className="h-7 w-16 mb-1 rounded-[2px]" />
            <Skeleton className="h-3 w-8 mb-3 rounded-[2px]" />
            <Skeleton className="h-3 w-20 mb-1 rounded-[2px]" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-28 rounded-[2px]" />
              <Skeleton className="h-3 w-24 rounded-[2px]" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 flex items-center justify-center gap-2">
        <span className="font-mono text-[11px] text-fg-muted">fetching</span>
        <span
          aria-hidden
          className="animate-cursor inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-accent align-middle"
        />
      </div>
    </div>
  );
}

export default DeveloperGridSkeleton;

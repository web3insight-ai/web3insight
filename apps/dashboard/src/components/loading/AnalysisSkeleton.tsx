import { Skeleton } from "@/components/ui";

interface AnalysisSkeletonProps {
  showUserInfo?: boolean;
  showEcosystemCards?: boolean;
  userCount?: number;
}

function AnalysisSkeleton({
  showUserInfo = true,
  showEcosystemCards = true,
  userCount = 1,
}: AnalysisSkeletonProps) {
  return (
    <div className="space-y-6">
      {showUserInfo && (
        <div className="space-y-4">
          {Array.from({ length: userCount }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border border-rule rounded-[2px] bg-bg-raised"
            >
              <Skeleton className="flex rounded-[2px] w-12 h-12" />

              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-[2px]" />
                <Skeleton className="h-3 w-64 rounded-[2px]" />

                <div className="flex items-center gap-2 mt-3 font-mono text-[11px] text-fg-muted">
                  <span>analyzing repository contributions</span>
                  <span
                    aria-hidden
                    className="animate-cursor inline-block h-[0.85em] w-[0.55ch] translate-y-[1px] bg-accent align-middle"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEcosystemCards && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded-[2px]" /> {/* Section title */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-4 border border-rule rounded-[2px] bg-bg-raised space-y-3"
              >
                {/* Ecosystem name */}
                <Skeleton className="h-5 w-24 rounded-[2px]" />

                {/* Score */}
                <Skeleton className="h-8 w-16 rounded-[2px]" />

                {/* Repository list */}
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, repoIndex) => (
                    <div
                      key={repoIndex}
                      className="flex justify-between items-center"
                    >
                      <Skeleton className="h-3 w-32 rounded-[2px]" />
                      <Skeleton className="h-3 w-12 rounded-[2px]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisSkeleton;

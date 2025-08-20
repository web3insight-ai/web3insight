import { Skeleton } from "@nextui-org/react";

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
            <div key={index} className="flex items-start space-x-4 p-4 border border-border dark:border-border-dark rounded-lg">
              {/* Avatar skeleton */}
              <Skeleton className="flex rounded-full w-12 h-12" />
              
              <div className="flex-1 space-y-2">
                {/* Name skeleton */}
                <Skeleton className="h-4 w-32 rounded" />
                
                {/* Bio skeleton */}
                <Skeleton className="h-3 w-64 rounded" />
                
                {/* Analysis progress indicator */}
                <div className="flex items-center space-x-2 mt-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Analyzing repository contributions...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEcosystemCards && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48 rounded" /> {/* Section title */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border border-border dark:border-border-dark rounded-lg space-y-3">
                {/* Ecosystem name */}
                <Skeleton className="h-5 w-24 rounded" />
                
                {/* Score */}
                <Skeleton className="h-8 w-16 rounded" />
                
                {/* Repository list */}
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, repoIndex) => (
                    <div key={repoIndex} className="flex justify-between items-center">
                      <Skeleton className="h-3 w-32 rounded" />
                      <Skeleton className="h-3 w-12 rounded" />
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

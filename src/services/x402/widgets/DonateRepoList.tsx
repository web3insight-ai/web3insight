"use client";

import { useEffect, useState, useRef } from "react";
import { Skeleton, Button } from "@nextui-org/react";
import { Inbox, RefreshCw } from "lucide-react";
import { useDonateRepoList } from "@/hooks/api/useDonate";
import { DonateRepoCard } from "./DonateRepoCard";

export function DonateRepoList() {
  const {
    data: repos = [],
    isPending,
    isFetching,
    fetchStatus,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useDonateRepoList();

  // Reason: Track if we've completed at least one CLIENT-SIDE fetch (not SSR hydration)
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const wasFetchingRef = useRef(false);

  useEffect(() => {
    // Reason: Detect transition from fetching -> idle to know when a real fetch completed
    // This avoids treating SSR hydration as a completed fetch
    if (fetchStatus === "fetching") {
      wasFetchingRef.current = true;
    } else if (fetchStatus === "idle" && wasFetchingRef.current) {
      setHasFetchedOnce(true);
      wasFetchingRef.current = false;
    }
  }, [fetchStatus]);

  // Reason: Also consider it fetched if we have data with a recent timestamp
  // (within last 5 seconds, indicating fresh fetch not stale SSR data)
  const hasFreshData = repos.length > 0 && dataUpdatedAt > Date.now() - 5000;

  const hasValidData = hasFetchedOnce || hasFreshData;

  // Reason: Show skeleton when:
  // 1. isPending = no cached data, waiting for first fetch
  // 2. !hasValidData = haven't completed a valid fetch yet
  // 3. isFetching && repos.length === 0 = fetching with empty cache
  const showSkeleton =
    isPending || !hasValidData || (isFetching && repos.length === 0);

  if (showSkeleton) {
    return <DonateRepoListSkeleton />;
  }

  // Reason: Show error state with retry button when fetch fails and no cached data
  if (isError && repos.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Failed to load repositories.
          {error?.message && (
            <span className="block text-xs mt-1 text-gray-400">
              {error.message}
            </span>
          )}
        </p>
        <Button
          size="sm"
          variant="flat"
          onPress={() => refetch()}
          startContent={<RefreshCw size={14} />}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Reason: Only show empty state after we've confirmed there's truly no data
  if (hasValidData && repos.length === 0) {
    return (
      <div className="py-16 text-center">
        <Inbox
          size={32}
          className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No repositories yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <DonateRepoCard key={repo.repo_id} repo={repo} />
      ))}
    </div>
  );
}

function DonateRepoListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 ml-13">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { DonateRepoListSkeleton };

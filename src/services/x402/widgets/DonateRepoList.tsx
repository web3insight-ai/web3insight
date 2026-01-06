"use client";

import { Skeleton } from "@nextui-org/react";
import { Inbox } from "lucide-react";
import { useDonateRepoList } from "@/hooks/api/useDonate";
import { DonateRepoCard } from "./DonateRepoCard";

export function DonateRepoList() {
  const { data: repos = [], isLoading, error } = useDonateRepoList();

  if (isLoading) {
    return <DonateRepoListSkeleton />;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Failed to load repositories. Please try again.
        </p>
      </div>
    );
  }

  if (repos.length === 0) {
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

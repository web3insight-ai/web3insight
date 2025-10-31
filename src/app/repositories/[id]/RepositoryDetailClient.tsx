'use client';

import { ChartSkeleton } from "$/loading";
import RepositoryDetailView from "~/repository/views/repository-detail";
import ClientOnly from "$/ClientOnly";

interface RepositoryDetailProps {
  repository: {
    id: number;
    name: string;
    starCount: number;
    forksCount: number;
    openIssuesCount: number;
    contributorCount: number;
    details: Record<string, unknown>;
  } | null;
  activeDevelopers: Array<{
    month: string;
    developers: number;
  }> | null;
}

export default function RepositoryDetailClient({ repository, activeDevelopers }: RepositoryDetailProps) {
  // Show loading skeleton while critical data is missing
  if (!repository || !repository.name) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
        <div className="w-full max-w-content mx-auto px-6">
          <div className="mb-8">
            <ChartSkeleton title="Loading repository..." height="120px" />
          </div>
          <ChartSkeleton title="Active Developers" height="280px" />
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <RepositoryDetailView repository={repository} activeDevelopers={activeDevelopers} />
    </ClientOnly>
  );
}

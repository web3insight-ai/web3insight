'use client';

import { ChartSkeleton } from "@/components/loading";
import RepositoryDetailView from "~/repository/views/repository-detail";
import ClientOnly from "../../../src/components/ClientOnly";

interface RepositoryDetailProps {
  repository: {
    id: number;
    name: string;
    starCount: number;
    forksCount: number;
    openIssuesCount: number;
    contributorCount: number;
    details: any;
  } | null;
  analysis: any;
}

export default function RepositoryDetailClient({
  repository,
  analysis,
}: RepositoryDetailProps) {
  // Show loading skeleton while critical data is missing
  if (!repository || !repository.name) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
        <div className="w-full max-w-content mx-auto px-6">
          <div className="mb-8">
            <ChartSkeleton title="Loading repository..." height="120px" />
          </div>
          <div className="space-y-6">
            <ChartSkeleton title="OpenRank Trend" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton title="Active Participants" height="280px" />
              <ChartSkeleton title="New Contributors" height="280px" />
            </div>
            <ChartSkeleton title="Repository Attention" height="280px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <RepositoryDetailView repository={repository} analysis={analysis} />
    </ClientOnly>
  );
}

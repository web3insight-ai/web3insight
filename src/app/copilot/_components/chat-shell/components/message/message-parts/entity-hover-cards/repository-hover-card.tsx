"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, GitFork, Users, Loader2 } from "lucide-react";
import Link from "next/link";

interface RepoRankRecord {
  repo_name: string;
  description?: string;
  star_count: number;
  forks_count: number;
  contributor_count: number;
}

interface RepositoriesApiResponse {
  success: boolean;
  data: { list: RepoRankRecord[] };
}

export function RepositoryHoverCard({ name }: { name: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["entity-hover", "repository", name],
    queryFn: async (): Promise<RepoRankRecord | null> => {
      const response = await fetch("/api/repositories");
      const json: RepositoriesApiResponse = await response.json();
      if (!json.success || !json.data?.list) return null;

      // Reason: Match repository name case-insensitively since the AI might
      // reference repos with different casing than the API returns.
      const match = json.data.list.find(
        (repo) => repo.repo_name.toLowerCase() === name.toLowerCase(),
      );
      return match ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex w-[280px] items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-[280px] p-4">
        <p className="text-sm text-muted-foreground">
          Could not load data for {name}
        </p>
      </div>
    );
  }

  return (
    <div className="w-[280px] p-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {data.repo_name}
      </p>

      {data.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {data.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 text-amber-500" />
          <span className="tabular-nums">
            {data.star_count.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <GitFork className="size-3" />
          <span className="tabular-nums">
            {data.forks_count.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" />
          <span className="tabular-nums">
            {data.contributor_count.toLocaleString()}
          </span>
        </div>
      </div>

      <Link
        href={`/repository/${data.repo_name}`}
        className="mt-3 block text-xs font-medium text-primary hover:text-primary/80"
      >
        View repository →
      </Link>
    </div>
  );
}

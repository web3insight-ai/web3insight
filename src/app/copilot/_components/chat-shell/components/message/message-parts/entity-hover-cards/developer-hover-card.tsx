"use client";

import { useQuery } from "@tanstack/react-query";
import { GitPullRequest, BookOpen, Code, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";

interface DeveloperData {
  username: string;
  nickname?: string;
  description?: string;
  avatar?: string;
  location?: string;
  statistics: {
    repository: number;
    pullRequest: number;
    codeReview: number;
  };
}

interface DeveloperApiResponse {
  success: boolean;
  data: DeveloperData;
}

export function DeveloperHoverCard({ username }: { username: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["entity-hover", "developer", username],
    queryFn: async (): Promise<DeveloperData | null> => {
      const response = await fetch(`/api/developers/${username}`);
      const json: DeveloperApiResponse = await response.json();
      if (!json.success || !json.data) return null;
      return json.data;
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
          Could not load profile for @{username}
        </p>
      </div>
    );
  }

  const displayName = data.nickname || data.username;
  const avatarUrl = data.avatar;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-[280px] p-4">
      <div className="flex items-start gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{data.username}
          </p>
        </div>
      </div>

      {data.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {data.description}
        </p>
      )}

      {data.location && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />
          <span>{data.location}</span>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1 text-xs dark:bg-muted/20">
          <BookOpen className="size-3" />
          <span>{data.statistics.repository} repos</span>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1 text-xs dark:bg-muted/20">
          <GitPullRequest className="size-3" />
          <span>{data.statistics.pullRequest} PRs</span>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-muted/40 px-2 py-1 text-xs dark:bg-muted/20">
          <Code className="size-3" />
          <span>{data.statistics.codeReview}</span>
        </div>
      </div>

      <Link
        href={`/developer/${data.username}`}
        className="mt-3 block text-xs font-medium text-primary hover:text-primary/80"
      >
        View full profile →
      </Link>
    </div>
  );
}

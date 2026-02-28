"use client";

import { GitFork, Star } from "lucide-react";
import { ToolResultCard, formatNumber, toNumber } from "./index";

interface DevRepo {
  rank: number;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
}

interface DeveloperReposData {
  username: string;
  topRepositories: DevRepo[];
}

function isValidData(data: unknown): data is DeveloperReposData {
  if (!data || typeof data !== "object") return false;
  if (!("topRepositories" in data) || !("username" in data)) return false;

  const d = data as DeveloperReposData;
  if (typeof d.username !== "string") return false;
  if (!Array.isArray(d.topRepositories)) return false;

  return d.topRepositories.every(
    (r) =>
      toNumber(r.rank) !== null &&
      typeof r.name === "string" &&
      toNumber(r.stars) !== null &&
      toNumber(r.forks) !== null,
  );
}

export default function DeveloperReposResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { username } = data;
  // Reason: Coerce string values to numbers for display
  const topRepositories = data.topRepositories.map((r) => ({
    ...r,
    rank: toNumber(r.rank) ?? 0,
    stars: toNumber(r.stars) ?? 0,
    forks: toNumber(r.forks) ?? 0,
  }));

  return (
    <ToolResultCard>
      <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
        {username}&apos;s Top Repositories
      </h4>

      <div className="space-y-0">
        {topRepositories.map((repo) => (
          <div
            key={repo.rank}
            className="border-b border-gray-100/80 py-2.5 last:border-0 dark:border-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {repo.name}
                </span>
                {repo.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {repo.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 text-amber-500" />
                {formatNumber(repo.stars)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <GitFork className="size-3.5" />
                {formatNumber(repo.forks)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

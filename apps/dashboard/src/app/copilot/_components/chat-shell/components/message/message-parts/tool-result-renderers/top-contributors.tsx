"use client";

import { ToolResultCard, formatNumber, toNumber } from "./index";

interface Contributor {
  rank: number;
  username: string;
  totalCommits: number;
  topRepos: string[];
}

interface TopContributorsData {
  ecosystem: string;
  topContributors: Contributor[];
}

function isValidData(data: unknown): data is TopContributorsData {
  if (!data || typeof data !== "object") return false;
  if (!("topContributors" in data)) return false;

  const d = data as TopContributorsData;
  if (!Array.isArray(d.topContributors)) return false;

  return d.topContributors.every(
    (c) =>
      toNumber(c.rank) !== null &&
      typeof c.username === "string" &&
      toNumber(c.totalCommits) !== null &&
      Array.isArray(c.topRepos),
  );
}

export default function TopContributorsResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { ecosystem } = data;
  // Reason: Coerce string values to numbers for display
  const topContributors = data.topContributors
    .map((c) => ({
      ...c,
      rank: toNumber(c.rank) ?? 0,
      totalCommits: toNumber(c.totalCommits) ?? 0,
    }))
    .slice(0, 10);

  return (
    <ToolResultCard>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-bold text-fg">Top Contributors</h4>
        <span className="rounded-[2px] border border-rule bg-bg-sunken px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          {ecosystem}
        </span>
      </div>

      <div className="space-y-0">
        {topContributors.map((contributor) => (
          <div
            key={contributor.rank}
            className="flex items-center gap-3 border-b border-rule py-2.5 last:border-0"
          >
            <span className="flex size-6 items-center justify-center rounded-[2px] border border-rule bg-bg-raised font-mono text-[11px] tabular-nums text-fg">
              {String(contributor.rank).padStart(3, "0")}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-fg">
                  {contributor.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNumber(contributor.totalCommits)} commits
                </span>
              </div>

              {contributor.topRepos.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {contributor.topRepos.map((repo) => (
                    <span
                      key={repo}
                      className="inline-flex rounded-[2px] border border-rule bg-bg-sunken px-1.5 py-0.5 font-mono text-[10px] text-fg-muted"
                    >
                      {repo}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

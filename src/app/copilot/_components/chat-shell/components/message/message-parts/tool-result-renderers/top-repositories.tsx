"use client";

import { GitFork, Star, Users } from "lucide-react";
import { ToolResultCard, formatNumber, toNumber } from "./index";

interface RankedRepo {
  rank: number;
  name: string;
  contributorCount: number;
  starCount: number;
  forksCount: number;
}

interface TopRepositoriesData {
  ecosystem: string;
  topRepositories: RankedRepo[];
}

function isValidData(data: unknown): data is TopRepositoriesData {
  if (!data || typeof data !== "object") return false;
  if (!("topRepositories" in data)) return false;

  const d = data as TopRepositoriesData;
  if (!Array.isArray(d.topRepositories)) return false;

  return d.topRepositories.every(
    (r) =>
      toNumber(r.rank) !== null &&
      typeof r.name === "string" &&
      toNumber(r.contributorCount) !== null &&
      toNumber(r.starCount) !== null &&
      toNumber(r.forksCount) !== null,
  );
}

export default function TopRepositoriesResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { ecosystem } = data;
  // Reason: Coerce string values to numbers for display
  const topRepositories = data.topRepositories
    .map((r) => ({
      ...r,
      rank: toNumber(r.rank) ?? 0,
      contributorCount: toNumber(r.contributorCount) ?? 0,
      starCount: toNumber(r.starCount) ?? 0,
      forksCount: toNumber(r.forksCount) ?? 0,
    }))
    .slice(0, 10);

  return (
    <ToolResultCard>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-bold text-fg">Top Repositories</h4>
        <span className="rounded-[2px] border border-rule bg-bg-sunken px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          {ecosystem}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rule bg-bg-sunken text-left font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
            <th className="pb-2 pr-2 font-medium">#</th>
            <th className="pb-2 pr-2 font-medium">Repository</th>
            <th className="pb-2 pr-2 text-right font-medium">Stars</th>
            <th className="pb-2 pr-2 text-right font-medium">Forks</th>
            <th className="pb-2 text-right font-medium">Contributors</th>
          </tr>
        </thead>
        <tbody>
          {topRepositories.map((repo) => (
            <tr key={repo.rank} className="border-b border-rule last:border-0">
              <td className="py-2 pr-2 font-mono tabular-nums text-fg-muted">
                {String(repo.rank).padStart(3, "0")}
              </td>
              <td className="py-2 pr-2">
                <span className="text-sm font-medium text-fg">{repo.name}</span>
              </td>
              <td className="py-2 pr-2 text-right">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Star className="size-3.5 text-amber-500" />
                  {formatNumber(repo.starCount)}
                </span>
              </td>
              <td className="py-2 pr-2 text-right">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <GitFork className="size-3.5" />
                  {formatNumber(repo.forksCount)}
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3.5" />
                  {formatNumber(repo.contributorCount)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ToolResultCard>
  );
}

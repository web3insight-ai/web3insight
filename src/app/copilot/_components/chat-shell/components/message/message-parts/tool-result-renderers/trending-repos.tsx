"use client";

import { Star, TrendingUp } from "lucide-react";
import { ToolResultCard, formatNumber, toNumber } from "./index";

interface TrendingRepo {
  rank: number;
  name: string;
  starGrowth7d: number;
  totalStars: number;
  description: string;
}

interface TrendingReposData {
  ecosystem: string;
  period: string;
  trendingRepositories: TrendingRepo[];
}

function isValidData(data: unknown): data is TrendingReposData {
  if (!data || typeof data !== "object") return false;
  if (!("trendingRepositories" in data)) return false;

  const d = data as TrendingReposData;
  if (!Array.isArray(d.trendingRepositories)) return false;

  return d.trendingRepositories.every(
    (r) =>
      toNumber(r.rank) !== null &&
      typeof r.name === "string" &&
      toNumber(r.starGrowth7d) !== null &&
      toNumber(r.totalStars) !== null,
  );
}

export default function TrendingReposResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { ecosystem } = data;
  // Reason: Coerce string values to numbers for display
  const trendingRepositories = data.trendingRepositories
    .map((r) => ({
      ...r,
      rank: toNumber(r.rank) ?? 0,
      starGrowth7d: toNumber(r.starGrowth7d) ?? 0,
      totalStars: toNumber(r.totalStars) ?? 0,
    }))
    .slice(0, 10);

  return (
    <ToolResultCard>
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
          Trending Repositories
        </h4>
        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {ecosystem}
        </span>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100/80 text-left text-xs text-muted-foreground dark:border-white/[0.04]">
            <th className="pb-2 pr-2 font-medium">#</th>
            <th className="pb-2 pr-2 font-medium">Repository</th>
            <th className="pb-2 pr-2 text-right font-medium">Stars</th>
            <th className="pb-2 text-right font-medium">7d Growth</th>
          </tr>
        </thead>
        <tbody>
          {trendingRepositories.map((repo) => (
            <tr
              key={repo.rank}
              className="border-b border-gray-100/80 last:border-0 dark:border-white/[0.04]"
            >
              <td className="py-2 pr-2 text-muted-foreground">{repo.rank}</td>
              <td className="py-2 pr-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {repo.name}
                </span>
              </td>
              <td className="py-2 pr-2 text-right">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Star className="size-3.5 text-amber-500" />
                  {formatNumber(repo.totalStars)}
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <TrendingUp className="size-3" />+
                  {formatNumber(repo.starGrowth7d)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ToolResultCard>
  );
}

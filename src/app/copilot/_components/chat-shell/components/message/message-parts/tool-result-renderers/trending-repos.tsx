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
        <h4 className="text-sm font-bold text-fg">Trending Repositories</h4>
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
            <th className="pb-2 text-right font-medium">7d Growth</th>
          </tr>
        </thead>
        <tbody>
          {trendingRepositories.map((repo) => (
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
                  {formatNumber(repo.totalStars)}
                </span>
              </td>
              <td className="py-2 text-right">
                <span className="inline-flex items-center gap-0.5 rounded-[2px] border border-accent/30 bg-accent-subtle px-2 py-0.5 font-mono text-[11px] tabular-nums text-accent">
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

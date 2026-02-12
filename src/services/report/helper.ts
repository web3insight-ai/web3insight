import type { YearlyReportData, YearlyDeveloperStat } from "./typing";

export function getLatestYearStats(
  data: YearlyReportData,
): YearlyDeveloperStat | null {
  const stats = data.yearly_stats;
  if (!stats.length) return null;
  return stats[stats.length - 1];
}

export function formatGrowthRate(rate: number | null): string {
  if (rate === null || rate === undefined) return "N/A";
  const prefix = rate > 0 ? "+" : "";
  return `${prefix}${rate}%`;
}

export function getTopItems<T>(list: T[], limit: number = 20): T[] {
  return list.slice(0, limit);
}

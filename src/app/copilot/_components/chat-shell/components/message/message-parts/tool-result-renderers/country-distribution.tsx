"use client";

import CountryDistributionChart from "@/components/CountryDistributionChart";
import { toNumber } from "./index";

interface CountryDistributionData {
  ecosystem: string;
  totalContributors: number | string;
  topCountries: Array<{
    rank: number | string;
    country: string;
    developerCount: number | string;
    percentage: string;
  }>;
}

function isValidData(data: unknown): data is CountryDistributionData {
  if (!data || typeof data !== "object") return false;
  if (!("ecosystem" in data) || !("topCountries" in data)) return false;

  const d = data as CountryDistributionData;
  if (typeof d.ecosystem !== "string") return false;
  if (!Array.isArray(d.topCountries)) return false;

  return d.topCountries.every(
    (c) =>
      toNumber(c.rank) !== null &&
      typeof c.country === "string" &&
      toNumber(c.developerCount) !== null,
  );
}

export default function CountryDistributionResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const { topCountries, totalContributors } = data;

  // Reason: Adapt tool output shape to CountryDistributionChart props
  // {country, developerCount} → {country, total}
  const chartData = topCountries.map((c) => ({
    country: c.country,
    total: toNumber(c.developerCount) ?? 0,
  }));

  // Reason: The full CountryDistributionChart includes a 440px world map which
  // is too tall for inline chat context. We constrain it with overflow/scale.
  return (
    <div className="overflow-hidden rounded-xl [&_.highcharts-container]:!h-[200px] [&>div]:!p-3">
      <CountryDistributionChart
        data={chartData}
        totalDevelopers={toNumber(totalContributors) ?? 0}
      />
    </div>
  );
}

"use client";

import EcosystemRankingChart from "@/components/EcosystemRankingChart";
import { toNumber } from "./index";

interface EcosystemRankingData {
  topEcosystems: Array<{
    rank: number | string;
    name: string;
    developerCount: number | string;
  }>;
}

function isValidData(data: unknown): data is EcosystemRankingData {
  if (!data || typeof data !== "object") return false;
  if (!("topEcosystems" in data)) return false;

  const d = data as EcosystemRankingData;
  if (!Array.isArray(d.topEcosystems)) return false;

  return d.topEcosystems.every(
    (e) =>
      toNumber(e.rank) !== null &&
      typeof e.name === "string" &&
      toNumber(e.developerCount) !== null,
  );
}

export default function EcosystemRankingResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  // Reason: Adapt tool output shape to EcosystemRankingChart props
  // {name, developerCount} → {ecosystem, count}
  const ecosystemRanking = data.topEcosystems.map((e) => ({
    ecosystem: e.name,
    count: toNumber(e.developerCount) ?? 0,
  }));

  return <EcosystemRankingChart ecosystemRanking={ecosystemRanking} />;
}

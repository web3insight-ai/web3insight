"use client";

import { Database, Globe2, UserCheck, Users } from "lucide-react";
import { ToolResultCard, formatNumber, toNumber } from "./index";

interface PlatformOverviewData {
  totalEcosystems: number;
  totalRepositories: number;
  totalDevelopers: number;
  totalCoreDevelopers: number;
}

function isValidData(data: unknown): data is PlatformOverviewData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    toNumber(d.totalEcosystems) !== null &&
    toNumber(d.totalRepositories) !== null &&
    toNumber(d.totalDevelopers) !== null &&
    toNumber(d.totalCoreDevelopers) !== null
  );
}

// Reason: Coerce raw API values to numbers after validation passes
function coerceData(data: Record<string, unknown>): PlatformOverviewData {
  return {
    totalEcosystems: toNumber(data.totalEcosystems)!,
    totalRepositories: toNumber(data.totalRepositories)!,
    totalDevelopers: toNumber(data.totalDevelopers)!,
    totalCoreDevelopers: toNumber(data.totalCoreDevelopers)!,
  };
}

const METRICS = [
  { key: "totalEcosystems" as const, label: "Ecosystems", Icon: Globe2 },
  { key: "totalRepositories" as const, label: "Repositories", Icon: Database },
  { key: "totalDevelopers" as const, label: "Developers", Icon: Users },
  {
    key: "totalCoreDevelopers" as const,
    label: "Core Developers",
    Icon: UserCheck,
  },
];

export default function PlatformOverviewResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const coerced = coerceData(data as unknown as Record<string, unknown>);

  return (
    <ToolResultCard>
      <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
        Platform Overview
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border/40 bg-muted/20 p-3 dark:border-border-dark/40 dark:bg-muted/10"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-1.5 dark:bg-indigo-500/10">
                <metric.Icon className="size-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {metric.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-gray-900 dark:text-white">
              {formatNumber(coerced[metric.key])}
            </p>
          </div>
        ))}
      </div>
    </ToolResultCard>
  );
}

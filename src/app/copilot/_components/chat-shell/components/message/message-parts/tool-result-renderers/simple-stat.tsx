"use client";

import { ToolResultCard, toNumber } from "./index";

// Reason: This renderer handles multiple tool outputs that each return a single
// stat value. We detect which field is present to determine the label.
interface StatField {
  key: string;
  label: string;
}

const KNOWN_STAT_FIELDS: StatField[] = [
  { key: "totalRepositories", label: "Total Repositories" },
  { key: "totalContributors", label: "Total Contributors" },
  { key: "totalEcosystems", label: "Total Ecosystems" },
  {
    key: "newContributorsLastQuarter",
    label: "New Contributors (Last Quarter)",
  },
];

interface DetectedStat {
  label: string;
  value: number;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function detectStat(data: Record<string, unknown>): DetectedStat | null {
  for (const field of KNOWN_STAT_FIELDS) {
    if (field.key in data) {
      const num = toNumber(data[field.key]);
      if (num !== null) {
        return { label: field.label, value: num };
      }
    }
  }
  return null;
}

function isValidData(data: unknown): data is Record<string, unknown> {
  return !!data && typeof data === "object" && !Array.isArray(data);
}

export default function SimpleStatResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const stat = detectStat(data);

  if (!stat) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  const ecosystem = typeof data.ecosystem === "string" ? data.ecosystem : null;
  const scope = typeof data.scope === "string" ? data.scope : null;

  return (
    <ToolResultCard>
      <div className="flex flex-col items-center py-2 text-center">
        <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
          {formatNum(stat.value)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        {(ecosystem || scope) && (
          <p className="mt-1 text-xs text-muted-foreground/70">
            {[ecosystem, scope].filter(Boolean).join(" \u00b7 ")}
          </p>
        )}
      </div>
    </ToolResultCard>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ToolResultCard, toNumber } from "./index";

interface ComparisonEntry {
  ecosystem: string;
  developers: number;
  coreDevelopers: number;
  newDevelopers: number;
  repositories: number;
}

interface EcosystemComparisonData {
  comparison: ComparisonEntry[];
  note?: string;
}

function isValidData(data: unknown): data is EcosystemComparisonData {
  if (!data || typeof data !== "object") return false;
  if (!("comparison" in data)) return false;

  const d = data as EcosystemComparisonData;
  if (!Array.isArray(d.comparison)) return false;

  return d.comparison.every(
    (c) =>
      typeof c.ecosystem === "string" &&
      toNumber(c.developers) !== null &&
      toNumber(c.coreDevelopers) !== null &&
      toNumber(c.repositories) !== null,
  );
}

export default function EcosystemComparisonResult({ data }: { data: unknown }) {
  if (!isValidData(data)) {
    return (
      <p className="text-sm text-muted-foreground">Unable to display results</p>
    );
  }

  // Reason: Coerce string values to numbers for Recharts
  const comparison = data.comparison.map((c) => ({
    ...c,
    developers: toNumber(c.developers) ?? 0,
    coreDevelopers: toNumber(c.coreDevelopers) ?? 0,
    newDevelopers: toNumber(c.newDevelopers) ?? 0,
    repositories: toNumber(c.repositories) ?? 0,
  }));
  const { note } = data;

  return (
    <ToolResultCard>
      <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
        Ecosystem Comparison
      </h4>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={comparison}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="ecosystem" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-dark, #1f2937)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f3f4f6",
            }}
          />
          <Legend />
          <Bar dataKey="developers" fill="#6366f1" name="Developers" />
          <Bar dataKey="coreDevelopers" fill="#8b5cf6" name="Core Devs" />
          <Bar dataKey="repositories" fill="#06b6d4" name="Repositories" />
        </BarChart>
      </ResponsiveContainer>

      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </ToolResultCard>
  );
}

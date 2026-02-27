"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe2, Users, Database, Loader2 } from "lucide-react";
import Link from "next/link";

interface EcoRankRecord {
  eco_name: string;
  repos_total: number;
  actors_total: number;
  actors_core_total: number;
  actors_new_total: number;
}

interface EcosystemsApiResponse {
  success: boolean;
  data: { list: EcoRankRecord[] };
}

export function EcosystemHoverCard({ name }: { name: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["entity-hover", "ecosystem", name],
    queryFn: async (): Promise<EcoRankRecord | null> => {
      const response = await fetch("/api/ecosystems");
      const json: EcosystemsApiResponse = await response.json();
      if (!json.success || !json.data?.list) return null;

      // Reason: Match ecosystem name case-insensitively since the AI
      // might capitalize differently than the API returns.
      const match = json.data.list.find(
        (eco) => eco.eco_name.toLowerCase() === name.toLowerCase(),
      );
      return match ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex w-[260px] items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-[260px] p-4">
        <p className="text-sm text-muted-foreground">
          Could not load data for {name}
        </p>
      </div>
    );
  }

  return (
    <div className="w-[260px] p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-1.5 dark:bg-indigo-500/10">
          <Globe2 className="size-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {data.eco_name}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatItem
          icon={<Users className="size-3" />}
          label="Developers"
          value={data.actors_total.toLocaleString()}
        />
        <StatItem
          icon={<Users className="size-3" />}
          label="Core Devs"
          value={data.actors_core_total.toLocaleString()}
        />
        <StatItem
          icon={<Database className="size-3" />}
          label="Repositories"
          value={data.repos_total.toLocaleString()}
        />
        <StatItem
          icon={<Users className="size-3" />}
          label="New Devs"
          value={data.actors_new_total.toLocaleString()}
        />
      </div>

      <Link
        href={`/ecosystem/${data.eco_name}`}
        className="mt-3 block text-xs font-medium text-primary hover:text-primary/80"
      >
        View ecosystem →
      </Link>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-muted/30 p-2 dark:bg-muted/10">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

"use client";

import MetricOverviewSkeleton from "./loading/MetricOverviewSkeleton";
import type { DataValue } from "@/types";
import { BigNumber } from "$/primitives";

type MetricOverviewProps = {
  dataSource: Record<string, DataValue>;
  isLoading?: boolean;
};

function MetricOverview({
  dataSource,
  isLoading = false,
}: MetricOverviewProps) {
  if (isLoading) {
    return <MetricOverviewSkeleton />;
  }

  const core = Number(dataSource.coreDeveloper);
  const eco = Number(dataSource.developer);
  const ecos = Number(dataSource.ecosystem);
  const repos = Number(dataSource.repository);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 py-2">
      <div className="lg:col-span-6">
        <BigNumber
          label="Core developers"
          value={Number.isFinite(core) ? core : null}
          format="compact"
          size="hero"
          footnote="Authors of pull requests or push events in the past 12 months. The headline figure this platform is built around."
        />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-10">
        <BigNumber
          label="Eco contributors"
          value={Number.isFinite(eco) ? eco : null}
          format="compact"
          footnote="All-time activity (stars excluded) in tracked ecosystems."
        />
        <BigNumber
          label="Ecosystems tracked"
          value={Number.isFinite(ecos) ? ecos : null}
          format="full"
        />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-10">
        <BigNumber
          label="Repositories"
          value={Number.isFinite(repos) ? repos : null}
          format="compact"
          footnote="Grouped by ecosystem. Includes archived repos with recent activity."
        />
      </div>
    </div>
  );
}

export default MetricOverview;
export type { MetricOverviewProps };

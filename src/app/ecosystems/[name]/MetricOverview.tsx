import clsx from "clsx";

import { Panel } from "$/blueprint";
import { BigNumber } from "$/primitives";

import type { MetricOverviewProps } from "./typing";

type Metric = {
  code: string;
  label: string;
  value: number;
  footnote: string;
  ground: "plain" | "dotted" | "hatched";
};

function resolveMetrics(
  dataSource: MetricOverviewProps["dataSource"],
): Metric[] {
  return [
    {
      code: "01",
      label: "core devs",
      value: Number(dataSource.developerCoreCount),
      footnote: "src: opendigger · 12m PR / push",
      ground: "dotted",
    },
    {
      code: "02",
      label: "eco contributors",
      value: Number(dataSource.developerTotalCount),
      footnote: "all-time, stars excluded",
      ground: "plain",
    },
    {
      code: "03",
      label: "new · 90d",
      value: Number(dataSource.developerGrowthCount),
      footnote: "first activity, last 90 days",
      ground: "hatched",
    },
    {
      code: "04",
      label: "repositories",
      value: Number(dataSource.repositoryTotalCount),
      footnote: "tracked under ecosystem",
      ground: "plain",
    },
  ];
}

function MetricOverview({ className, dataSource }: MetricOverviewProps) {
  return (
    <div className={clsx("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {resolveMetrics(dataSource).map((metric) => (
        <Panel
          key={metric.code}
          ground={metric.ground}
          label={{ text: metric.label, position: "tl" }}
          code={metric.code}
          className="p-5 h-full"
        >
          <BigNumber
            label=""
            value={metric.value}
            format="compact"
            footnote={metric.footnote}
          />
        </Panel>
      ))}
    </div>
  );
}

export default MetricOverview;

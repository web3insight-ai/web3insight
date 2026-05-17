import type { Developer } from "../../typing";

type MetricOverviewWidgetProps = {
  className?: string;
  dataSource: Pick<Developer["statistics"], "pullRequest" | "codeReview">;
};

export type { MetricOverviewWidgetProps };

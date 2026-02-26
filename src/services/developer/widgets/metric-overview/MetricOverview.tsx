import clsx from "clsx";
import { Card, CardBody } from "@/components/ui";

import type { MetricOverviewWidgetProps } from "./typing";

function MetricOverview({ className, dataSource }: MetricOverviewWidgetProps) {
  const totalPRs = dataSource.pullRequest + dataSource.codeReview;
  const metrics = [
    {
      label: `${dataSource.pullRequest} PRs`,
      value: totalPRs,
    },
  ];

  return (
    <div className={clsx("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {metrics.map((metric) => (
        <Card
          key={metric.label.replaceAll(" ", "")}
          className="bg-white dark:bg-surface-dark shadow-sm border-none"
        >
          <CardBody className="p-4">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value.toLocaleString()}
              </p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export default MetricOverview;

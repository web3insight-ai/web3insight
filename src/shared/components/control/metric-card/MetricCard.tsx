import clsx from "clsx";
import { Card, CardBody } from "@nextui-org/react";

import type { MetricCardProps } from "./typing";
import GrowthIndicator from "./GrowthIndicator";

function MetricCard({ label, value, growth, icon, iconBgClassName }: MetricCardProps) {
  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark hover:shadow-card transition-all duration-200 hover:scale-[1.02] group">
      <CardBody className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={clsx("flex-shrink-0 p-2.5 rounded-lg transition-transform duration-200 group-hover:scale-110", iconBgClassName)}>
              {icon}
            </div>
            {growth !== undefined && <GrowthIndicator value={`${growth > 0 ? ('+' + growth) : growth}%`} positive={growth > 0} />}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {value}
            </h2>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default MetricCard;

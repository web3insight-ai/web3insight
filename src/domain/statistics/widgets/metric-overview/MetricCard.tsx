import clsx from "clsx";
import { Card, CardBody } from "@nextui-org/react";

import type { MetricCardProps } from "./typing";
import GrowthIndicator from "./GrowthIndicator";

function MetricCard({ label, value, growth, icon, iconBgClassName }: MetricCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300">
      <CardBody className="p-6">
        <div className="flex items-center gap-4">
          <div className={clsx("flex-shrink-0 p-3 rounded-xl", iconBgClassName)}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </h2>
            {growth !== undefined && <GrowthIndicator value={`${growth > 0 ? ('+' + growth) : growth}%`} positive={growth > 0} />}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default MetricCard;

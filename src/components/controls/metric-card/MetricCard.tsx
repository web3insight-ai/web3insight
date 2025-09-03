import clsx from "clsx";
import { Card, CardBody, Tooltip } from "@nextui-org/react";
import { Info } from "lucide-react";

import type { MetricCardProps } from "./typing";
import GrowthIndicator from "./GrowthIndicator";

function MetricCard({ label, value, growth, icon, iconBgClassName, tooltip }: MetricCardProps) {
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
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
              {tooltip && (
                <Tooltip
                  content={tooltip}
                  placement="top"
                  classNames={{
                    base: "max-w-xs",
                    // Use elevated surface and subtle border in dark mode to match theme
                    content: "bg-white dark:bg-surface-elevated text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-border-dark shadow-lg text-xs leading-relaxed p-3 rounded-lg",
                    arrow: "bg-white dark:bg-surface-elevated border border-gray-200 dark:border-border-dark",
                  }}
                  delay={300}
                  closeDelay={0}
                >
                  <Info 
                    size={12} 
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-help" 
                  />
                </Tooltip>
              )}
            </div>
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

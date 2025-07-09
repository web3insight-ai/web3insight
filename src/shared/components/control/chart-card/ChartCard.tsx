import clsx from "clsx";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import ReactEcharts from "echarts-for-react";
import { Users } from "lucide-react";

import type { ChartCardProps } from "./typing";

function ChartCard({ className, title, style, option, chartContainerClassName }: ChartCardProps) {
  return (
    <Card className={clsx("bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden", className)}>
      <CardHeader className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
      </CardHeader>
      <Divider className="bg-border dark:bg-border-dark" />
      <CardBody className="px-6 py-4">
        <div className={clsx("w-full overflow-hidden", chartContainerClassName)} style={style}>
          <ReactEcharts 
            style={{ width: '100%', height: '100%' }} 
            option={option}
          />
        </div>
      </CardBody>
    </Card>
  );
}

export default ChartCard;

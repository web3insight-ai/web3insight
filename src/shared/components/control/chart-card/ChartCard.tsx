import clsx from "clsx";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import ReactEcharts from "echarts-for-react";

import type { ChartCardProps } from "./typing";

function ChartCard({ className, title, style, option }: ChartCardProps) {
  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none", className)}>
      <CardHeader className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="h-64 w-full">
          <ReactEcharts style={style} option={option} />
        </div>
      </CardBody>
    </Card>
  );
}

export default ChartCard;

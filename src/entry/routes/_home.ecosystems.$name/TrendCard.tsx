import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import ReactEcharts from "echarts-for-react";
import dayjs from "dayjs";

import type { TrendCardProps } from "./typing";

function resolveChartOptions(dataSource: TrendCardProps["dataSource"]) {
  const xaxisData: string[] = [];
  const seriesData: number[] = [];

  dataSource.slice().reverse().forEach(({ date, total }) => {
    xaxisData.push(dayjs(date).format("MMM, YYYY"));
    seriesData.push(total);
  });

  return {
    grid: {
      left: "5%",
      right: "5%",
      top: "10%",
      bottom: "10%",
    },
    xAxis: {
      type: "category",
      data: xaxisData,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: seriesData,
        type: "line",
        label: { show: true, position: "top" },
      }
    ]
  };
}

function TrendCard({ dataSource }: TrendCardProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none mb-10">
      <CardHeader className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Developer Activity Trend</h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="h-64 w-full">
          <ReactEcharts
            option={resolveChartOptions(dataSource)}
            style={{ height: "250px" }}
          />
        </div>
      </CardBody>
    </Card>
  );
}

export default TrendCard;

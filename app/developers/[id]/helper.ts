import type { EChartsOption } from "echarts";
import dayjs from "dayjs";

import type { DeveloperContribution } from "~/developer/typing";

function resolveChartOptions(dataSource: DeveloperContribution[]): EChartsOption {
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
      },
    ],
  };
}

export { resolveChartOptions };

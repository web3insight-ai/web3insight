import type { EChartsOption } from "echarts";

import type { EcosystemAnalytics } from "../../typing";

function resolveChartOptions(dataSource: EcosystemAnalytics[]): EChartsOption {
  const xaxisData: string[] = [];
  const seriesData: number[] = [];

  dataSource.slice().forEach(({ name, score }) => {
    xaxisData.push(name);
    seriesData.push(score);
  });

  return {
    grid: {
      left: "5%",
      right: "5%",
      top: "10%",
      // Dynamically calculate bottom padding: based on the longest label character count (each character occupies approximately 1.3% height)
      bottom: `${Math.max(...xaxisData.map(name => name.length)) * 1.3 + 5}%`,
    },
    xAxis: {
      type: "category",
      data: xaxisData,
      axisLabel: {
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: seriesData,
        type: "bar",
        label: { show: true, position: "top" },
      },
    ],
  };
}

export { resolveChartOptions };

import type { EChartsOption } from "echarts";
import dayjs from "dayjs";

import type { ActorTrendRecord } from "~/api/typing";

function resolveChartOptions(dataSource: ActorTrendRecord[]): EChartsOption {
  const xaxisData: string[] = [];
  const seriesData: number[] = [];

  dataSource.slice().reverse().forEach(({ date, total }) => {
    xaxisData.push(dayjs(date).format("MMM, YYYY"));
    seriesData.push(total);
  });

  return {
    grid: {
      left: "8%",
      right: "4%",
      top: "5%",
      bottom: "20%",
    },
    xAxis: {
      type: "category",
      data: xaxisData,
      axisLabel: {
        fontSize: 9,
        color: '#6B7280',
        rotate: 45,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 9,
        color: '#6B7280',
      },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB',
          opacity: 0.5,
        },
      },
    },
    tooltip: {
      fontSize: 10,
      formatter: (params: { name: string; value: number }) => `${params.name}<br/>Activity: ${params.value}`,
    },
    series: [
      {
        data: seriesData,
        type: "line",
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#0D9488',
        },
        itemStyle: {
          color: '#0D9488',
        },
        label: { show: false },
      },
    ],
  };
}

export { resolveChartOptions };

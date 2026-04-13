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
      left: "10%",
      right: "5%",
      top: "10%",
      bottom: "25%",
    },
    xAxis: {
      type: "category",
      data: xaxisData,
      axisLabel: {
        rotate: 45,
        fontSize: 9,
        color: "var(--fg-muted)",
      },
      axisLine: {
        lineStyle: {
          color: "var(--rule)",
        },
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 9,
        color: "var(--fg-muted)",
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "var(--rule)",
          type: "dashed",
          opacity: 0.5,
        },
      },
    },
    series: [
      {
        data: seriesData,
        type: "bar",
        itemStyle: {
          color: "var(--accent)",
        },
        label: {
          show: false,
        },
        barWidth: "60%",
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "var(--bg-raised)",
      borderColor: "var(--rule-strong)",
      borderWidth: 1,
      textStyle: {
        color: "var(--fg)",
        fontSize: 10,
      },
      formatter: function (params: unknown) {
        const paramsArray = Array.isArray(params) ? params : [params];
        const data = paramsArray[0] as { name: string; value: number };
        return `${data.name}: ${data.value}`;
      },
    },
  };
}

export { resolveChartOptions };

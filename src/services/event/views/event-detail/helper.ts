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
        color: '#6B7280',
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB',
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
        color: '#6B7280',
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6',
          type: 'dashed',
          opacity: 0.5,
        },
      },
    },
    series: [
      {
        data: seriesData,
        type: "bar",
        itemStyle: {
          color: '#0D9488',
        },
        label: {
          show: false,
        },
        barWidth: '60%',
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 10,
      },
      formatter: function(params: unknown) {
        const paramsArray = Array.isArray(params) ? params : [params];
        const data = paramsArray[0] as { name: string; value: number };
        return `${data.name}: ${data.value}`;
      },
    },
  };
}

export { resolveChartOptions };

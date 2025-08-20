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
      top: "5%",
      // Dynamically calculate bottom padding: based on the longest label character count (each character occupies approximately 1.3% height)
      bottom: `${Math.max(...xaxisData.map(name => name.length)) * 1.3 + 5}%`,
    },
    xAxis: {
      type: "category",
      data: xaxisData,
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        color: '#6B7280',
        fontWeight: 500,
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
      axisTick: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: 500,
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
        },
      },
    },
    series: [
      {
        data: seriesData,
        type: "bar",
        itemStyle: {
          color: '#3B82F6',
        },
        label: {
          show: true,
          position: "top",
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12,
      },
      formatter: function(params: unknown) {
        const paramsArray = Array.isArray(params) ? params : [params];
        const data = paramsArray[0] as { name: string; value: number };
        return `
          <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 8px; height: 8px; background: #3B82F6; border-radius: 50%;"></div>
            Score: <span style="font-weight: 600;">${data.value}</span>
          </div>
        `;
      },
    },
  };
}

export { resolveChartOptions };

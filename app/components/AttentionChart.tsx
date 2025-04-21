import React from "react";
import ReactECharts from "echarts-for-react";
import { useMediaQuery } from "react-responsive";

interface AttentionChartProps {
  data: Record<string, number>;
  repoName: string;
}

const AttentionChart: React.FC<AttentionChartProps> = ({ data, repoName }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const keys = Object.keys(data).filter((k) => k.length === 7);
  const values = keys.map((k) => data[k]);

  const accValue = values.reduce((acc: number[], curr) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(last + curr);
    return acc;
  }, []);

  const option = {
    title: {
      text: `Attention for ${repoName}`,
      left: "center",
      textStyle: {
        fontSize: isMobile ? 14 : 18,
      },
    },
    grid: {
      top: isMobile ? 60 : 80,
      bottom: isMobile ? 60 : 80,
      left: isMobile ? 40 : 80,
      right: isMobile ? 20 : 40,
    },
    xAxis: {
      type: "category" as const,
      data: keys,
      axisLabel: {
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
      },
    },
    yAxis: [
      {
        type: "value" as const,
        axisLabel: {
          fontSize: isMobile ? 10 : 12,
        },
      },
      {
        type: "value" as const,
        axisLabel: {
          fontSize: isMobile ? 10 : 12,
        },
      },
    ],
    series: [
      {
        type: "bar",
        data: values,
        name: "Attention",
      },
      {
        type: "line",
        yAxisIndex: 1,
        data: accValue,
        smooth: true,
        name: "Accumulated Attention",
      },
    ],
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Attention", "Accumulated Attention"],
      top: "bottom",
      textStyle: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: isMobile ? 50 : 100,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: isMobile ? "300px" : "400px", width: "100%" }}
    />
  );
};

export default AttentionChart;

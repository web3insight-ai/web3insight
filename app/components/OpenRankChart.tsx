import React from "react";
import ReactECharts from "echarts-for-react";
import { useMediaQuery } from "react-responsive";

interface OpenRankChartProps {
  data: Record<string, number>;
  repoName: string;
}

const OpenRankChart: React.FC<OpenRankChartProps> = ({ data, repoName }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const keys = Object.keys(data).filter((k) => k.length === 7);
  const values = keys.map((k) => data[k]);

  const option = {
    title: {
      text: `OpenRank for ${repoName}`,
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
    yAxis: {
      type: "value" as const,
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    series: [
      {
        data: values,
        type: "bar",
        name: "OpenRank",
      },
    ],
    tooltip: {
      trigger: "axis",
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

export default OpenRankChart;

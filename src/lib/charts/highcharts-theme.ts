import type Highcharts from "highcharts";
import { categoricalTeal, resolveChartTheme } from "./palette";

export function buildHighchartsTheme(): Highcharts.Options {
  const t = resolveChartTheme();

  return {
    colors: [...categoricalTeal],
    chart: {
      backgroundColor: "transparent",
      style: {
        fontFamily: t.fontSans,
        color: t.fg,
      },
    },
    title: {
      style: {
        color: t.fg,
        fontFamily: t.fontSans,
        fontWeight: "600",
      },
    },
    subtitle: {
      style: {
        color: t.fgMuted,
        fontFamily: t.fontSans,
      },
    },
    xAxis: {
      lineColor: t.rule,
      tickColor: t.rule,
      gridLineColor: "transparent",
      labels: {
        style: {
          color: t.fgMuted,
          fontFamily: t.fontSans,
          fontSize: "11px",
        },
      },
    },
    yAxis: {
      lineColor: "transparent",
      gridLineColor: t.rule,
      gridLineDashStyle: "Dash",
      labels: {
        style: {
          color: t.fgMuted,
          fontFamily: t.fontMono,
          fontSize: "11px",
        },
      },
    },
    legend: {
      itemStyle: {
        color: t.fgMuted,
        fontFamily: t.fontSans,
        fontWeight: "400",
      },
      itemHoverStyle: { color: t.fg },
    },
    tooltip: {
      backgroundColor: t.bgRaised,
      borderColor: t.ruleStrong,
      borderRadius: 4,
      shadow: false,
      style: {
        color: t.fg,
        fontFamily: t.fontMono,
        fontSize: "12px",
      },
    },
    plotOptions: {
      series: { borderWidth: 0 },
      line: { marker: { enabled: false, radius: 3 } },
      column: { borderRadius: 2 },
    },
    credits: { enabled: false },
  };
}

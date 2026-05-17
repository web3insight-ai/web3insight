import { categoricalTeal, resolveChartTheme } from "./palette";

export function buildEChartsTheme() {
  const t = resolveChartTheme();

  return {
    color: [...categoricalTeal],
    backgroundColor: "transparent",
    textStyle: {
      fontFamily: t.fontSans,
      color: t.fg,
    },
    title: {
      textStyle: {
        fontFamily: t.fontSans,
        fontWeight: 600,
        color: t.fg,
      },
      subtextStyle: { color: t.fgMuted },
    },
    legend: {
      textStyle: {
        color: t.fgMuted,
        fontFamily: t.fontSans,
        fontSize: 12,
      },
      itemGap: 16,
      icon: "rect",
    },
    tooltip: {
      backgroundColor: t.bgRaised,
      borderColor: t.ruleStrong,
      borderWidth: 1,
      textStyle: {
        color: t.fg,
        fontFamily: t.fontMono,
        fontSize: 12,
      },
      padding: [8, 10],
      extraCssText:
        "box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 4px;",
    },
    grid: {
      left: "3%",
      right: "3%",
      bottom: "3%",
      containLabel: true,
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: t.rule } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: t.fgMuted,
        fontFamily: t.fontSans,
        fontSize: 11,
      },
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: t.rule, type: [2, 3] as unknown as string },
      },
      axisLabel: {
        color: t.fgMuted,
        fontFamily: t.fontMono,
        fontSize: 11,
      },
    },
    line: {
      itemStyle: { borderWidth: 2 },
      lineStyle: { width: 2 },
      symbolSize: 4,
      symbol: "circle",
      smooth: false,
    },
    bar: { itemStyle: { borderRadius: [2, 2, 0, 0] } },
  };
}

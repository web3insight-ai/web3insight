import type { CSSProperties } from "react";
import { resolveChartTheme } from "./palette";

export function getRechartsDefaults() {
  const t = resolveChartTheme();

  const axisTick: { fill: string; fontFamily: string; fontSize: number } = {
    fill: t.fgMuted,
    fontFamily: t.fontMono,
    fontSize: 11,
  };

  const axisLine = { stroke: t.rule };

  const gridStroke = t.rule;

  const tooltipStyle: CSSProperties = {
    background: t.bgRaised,
    border: `1px solid ${t.ruleStrong}`,
    borderRadius: 4,
    padding: "6px 10px",
    fontSize: 12,
    fontFamily: t.fontMono,
    color: t.fg,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };

  const tooltipLabelStyle: CSSProperties = {
    color: t.fgSubtle,
    fontFamily: t.fontSans,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  };

  const tooltipItemStyle: CSSProperties = {
    color: t.fg,
    fontFamily: t.fontMono,
  };

  return {
    axisTick,
    axisLine,
    gridStroke,
    tooltipStyle,
    tooltipLabelStyle,
    tooltipItemStyle,
  };
}

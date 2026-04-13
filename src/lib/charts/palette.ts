/**
 * Unified chart palette — derived from the teal brand hue.
 *
 * Consumed by all three chart libraries (ECharts, Highcharts, Recharts).
 * CSS variable references are resolved at paint time so palette switches
 * automatically with light/dark theme.
 */

export const sequentialTeal = [
  "oklch(88% 0.045 180)",
  "oklch(80% 0.065 180)",
  "oklch(70% 0.080 180)",
  "oklch(58% 0.085 180)",
  "oklch(47% 0.085 180)",
  "oklch(40% 0.075 180)",
  "oklch(32% 0.060 180)",
] as const;

export const categoricalTeal = [
  "oklch(47% 0.085 180)",
  "oklch(68% 0.009 180)",
  "oklch(32% 0.060 180)",
  "oklch(65% 0.130 60)",
  "oklch(54% 0.010 180)",
  "oklch(80% 0.065 180)",
] as const;

export const divergingTealAmber = {
  positive: "oklch(47% 0.085 180)",
  negative: "oklch(65% 0.130 60)",
  neutral: "oklch(68% 0.009 180)",
} as const;

export interface ResolvedChartTheme {
  bg: string;
  bgRaised: string;
  bgSunken: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  rule: string;
  ruleStrong: string;
  accent: string;
  fontSans: string;
  fontMono: string;
}

/**
 * Read computed CSS variables on the document root. Must be called
 * client-side. Call again on theme toggle to pick up the new values.
 */
export function resolveChartTheme(): ResolvedChartTheme {
  if (typeof window === "undefined") {
    return {
      bg: "oklch(98% 0.004 180)",
      bgRaised: "oklch(96% 0.005 180)",
      bgSunken: "oklch(93% 0.006 180)",
      fg: "oklch(13% 0.008 180)",
      fgMuted: "oklch(42% 0.010 180)",
      fgSubtle: "oklch(68% 0.009 180)",
      rule: "oklch(90% 0.007 180)",
      ruleStrong: "oklch(82% 0.008 180)",
      accent: "oklch(47% 0.085 180)",
      fontSans: "ui-sans-serif",
      fontMono: "ui-monospace",
    };
  }

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    bg: read("--bg", "oklch(98% 0.004 180)"),
    bgRaised: read("--bg-raised", "oklch(96% 0.005 180)"),
    bgSunken: read("--bg-sunken", "oklch(93% 0.006 180)"),
    fg: read("--fg", "oklch(13% 0.008 180)"),
    fgMuted: read("--fg-muted", "oklch(42% 0.010 180)"),
    fgSubtle: read("--fg-subtle", "oklch(68% 0.009 180)"),
    rule: read("--rule", "oklch(90% 0.007 180)"),
    ruleStrong: read("--rule-strong", "oklch(82% 0.008 180)"),
    accent: read("--accent", "oklch(47% 0.085 180)"),
    fontSans: read("--font-sans", "ui-sans-serif"),
    fontMono: read("--font-mono", "ui-monospace"),
  };
}

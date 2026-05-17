/**
 * Design tokens — OKLCH-based, teal-tinted.
 *
 * Exposed as strings for Tailwind / inline styles. For runtime consumers
 * (charts, framer-motion colors) prefer the CSS variable names in
 * `cssVar.*` so light/dark switching is free.
 */

export const teal = {
  50: "oklch(97% 0.015 180)",
  100: "oklch(94% 0.025 180)",
  200: "oklch(88% 0.045 180)",
  300: "oklch(80% 0.065 180)",
  400: "oklch(70% 0.080 180)",
  500: "oklch(58% 0.085 180)",
  600: "oklch(47% 0.085 180)",
  700: "oklch(40% 0.075 180)",
  800: "oklch(32% 0.060 180)",
  900: "oklch(24% 0.040 180)",
  950: "oklch(16% 0.025 180)",
} as const;

export const neutral = {
  50: "oklch(98% 0.004 180)",
  100: "oklch(96% 0.005 180)",
  150: "oklch(93% 0.006 180)",
  200: "oklch(90% 0.007 180)",
  300: "oklch(82% 0.008 180)",
  400: "oklch(68% 0.009 180)",
  500: "oklch(54% 0.010 180)",
  600: "oklch(42% 0.010 180)",
  700: "oklch(32% 0.010 180)",
  800: "oklch(22% 0.010 180)",
  850: "oklch(17% 0.009 180)",
  900: "oklch(13% 0.008 180)",
  950: "oklch(9% 0.007 180)",
} as const;

export const amber = {
  100: "oklch(94% 0.040 70)",
  400: "oklch(75% 0.140 60)",
  600: "oklch(65% 0.130 60)",
  800: "oklch(48% 0.110 55)",
} as const;

export const danger = {
  500: "oklch(58% 0.180 25)",
  600: "oklch(50% 0.170 25)",
} as const;

export const cssVar = {
  bg: "var(--bg)",
  bgRaised: "var(--bg-raised)",
  bgSunken: "var(--bg-sunken)",
  fg: "var(--fg)",
  fgMuted: "var(--fg-muted)",
  fgSubtle: "var(--fg-subtle)",
  rule: "var(--rule)",
  ruleStrong: "var(--rule-strong)",
  accent: "var(--accent)",
  accentFg: "var(--accent-fg)",
  accentMuted: "var(--accent-muted)",
  accentSubtle: "var(--accent-subtle)",
  warn: "var(--warn)",
  warnSubtle: "var(--warn-subtle)",
  danger: "var(--danger)",
  fontDisplay: "var(--font-display)",
  fontSans: "var(--font-sans)",
  fontMono: "var(--font-mono)",
} as const;

export type ThemeMode = "light" | "dark";

"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { buildHighchartsTheme } from "./highcharts-theme";

/**
 * Hook that applies our chart themes globally and reapplies them on
 * light/dark toggle. Mount once, near the root of the client tree.
 */
export function useChartThemes() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window === "undefined") return;
      try {
        const { default: Highcharts } = await import("highcharts");
        if (cancelled) return;
        Highcharts.setOptions(buildHighchartsTheme());
      } catch {
        // Highcharts not installed on every page — silently ignore.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);
}

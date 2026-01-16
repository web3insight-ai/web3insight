"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function PrefersColorSchemeSelector() {
  const { setTheme, theme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render theme-dependent UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const handleThemeToggle = useCallback(() => {
    setTheme(
      theme === "system"
        ? systemTheme === "dark"
          ? "light"
          : "dark"
        : theme === "dark"
          ? systemTheme === "light"
            ? "system"
            : "light"
          : systemTheme === "dark"
            ? "system"
            : "dark",
    );
  }, [setTheme, theme, systemTheme]);

  // Render placeholder with same dimensions to prevent layout shift
  if (!mounted) {
    return (
      <div
        className="
          flex items-center justify-center w-6 h-6 rounded-md
          bg-gray-100 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
        "
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={handleThemeToggle}
      className="
        flex items-center justify-center w-6 h-6 rounded-md
        bg-gray-100 dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
      "
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Moon className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}

export default PrefersColorSchemeSelector;

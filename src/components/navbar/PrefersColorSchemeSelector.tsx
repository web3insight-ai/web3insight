"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function PrefersColorSchemeSelector() {
  const { setTheme, theme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={handleThemeToggle}
      className="
        flex items-center justify-center w-8 h-8 rounded-lg
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-200 hover:scale-105 active:scale-95
      "
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      ) : (
        <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}

export default PrefersColorSchemeSelector;

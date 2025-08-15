import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

import type { Theme } from "./typing";

const storageKey = "w3i:perfersColorScheme";

function PrefersColorSchemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(storageKey) as Theme) || "system";
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: Theme) => {
      let shouldBeDark = false;
      
      if (t === "dark") {
        shouldBeDark = true;
      } else if (t === "light") {
        shouldBeDark = false;
      } else {
        // system
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        shouldBeDark = media.matches;
      }

      if (shouldBeDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      setIsDark(shouldBeDark);
    };

    applyTheme(theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "system") {
      // If system, switch to opposite of current appearance
      const newTheme = isDark ? "light" : "dark";
      setTheme(newTheme);
      localStorage.setItem(storageKey, newTheme);
    } else {
      // If manual theme, toggle between light and dark
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      localStorage.setItem(storageKey, newTheme);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center justify-center w-6 h-6 rounded-md
        bg-gray-100 dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
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

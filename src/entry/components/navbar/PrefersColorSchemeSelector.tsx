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
      className={`
        relative flex items-center justify-center size-8 rounded-full cursor-pointer
        transition-all duration-300 ease-in-out
        bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-800 dark:to-cyan-800
        border border-teal-200 dark:border-teal-600
        hover:scale-110 hover:shadow-lg hover:shadow-teal-200 dark:hover:shadow-teal-800/50
        active:scale-95
        group
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative size-4">
        <Sun 
          className={`
            absolute size-4 transition-all duration-300 ease-in-out
            text-teal-600 dark:text-teal-400
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        <Moon 
          className={`
            absolute size-4 transition-all duration-300 ease-in-out
            text-teal-600 dark:text-teal-400
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
      
      {/* Subtle glow effect */}
      <div className={`
        absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        bg-gradient-to-r from-teal-400/20 to-cyan-400/20
        blur-sm -z-10
      `} />
    </button>
  );
}

export default PrefersColorSchemeSelector;

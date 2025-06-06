import { useEffect, useState } from "react";
import { Theme } from "./typing";

export function PrefersColorSchemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (
      (localStorage.getItem("w3i:perfersColorScheme") as Theme) || "system"
    );
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: Theme) => {
      if (t === "dark") {
        root.classList.add("dark");
      } else if (t === "light") {
        root.classList.remove("dark");
      } else {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        if (media.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        applyTheme("system");
      };
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  const changeTheme = (value: Theme) => {
    setTheme(value);
    localStorage.setItem("w3i:perfersColorScheme", value);
  };
  const themeLabels: Record<Theme, string> = {
    system: "System Mode",
    light: "Light Mode",
    dark: "Dark Mode",
  };

  return (
    <select
      className="w-36 text-sm py-1 rounded-lg"
      value={theme}
      onChange={(e) => changeTheme(e.target.value as Theme)}
    >
      {Object.entries(themeLabels).map(([key, label]) => (
        <option className="text-sm" key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

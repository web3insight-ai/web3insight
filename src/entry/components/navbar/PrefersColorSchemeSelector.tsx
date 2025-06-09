import { useEffect, useState } from "react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { Sun, Moon, Monitor } from "lucide-react";

import type { Theme } from "./typing";

const storageKey = "w3i:perfersColorScheme";

const options = [
  { label: "Light", value: "light", iconCtor: Sun },
  { label: "Dark", value: "dark", iconCtor: Moon },
  { label: "System", value: "system", iconCtor: Monitor },
];
const optionsMap = options.reduce((acc, cur) => ({ ...acc, [cur.value]: cur }), {} as Record<Theme, (typeof options)[number]>);

function PrefersColorSchemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";

    return (
      (localStorage.getItem(storageKey) as Theme) || "system"
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
    localStorage.setItem(storageKey, value);
  };

  const ChosenIcon = optionsMap[theme].iconCtor;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div className="flex items-center justify-center size-8 border bg-slate-200 rounded-full cursor-pointer dark:bg-slate-400">
          {<ChosenIcon className="size-4" />}
        </div>
      </DropdownTrigger>
      <DropdownMenu items={options} onAction={k => changeTheme(k as Theme)}>
        {item => {
          const ItemIcon = item.iconCtor;

          return (
            <DropdownItem key={item.value} startContent={<ItemIcon className="size-4" />}>
              {item.label}
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}

export default PrefersColorSchemeSelector;

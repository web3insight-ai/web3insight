import clsx from "clsx";
import { Link } from "@remix-run/react";
import { useMediaQuery } from "react-responsive";

import { getTitle } from "@/utils/app";
import BrandLogo from "@/components/control/brand-logo";

import AuthStatus from "../../components/AuthStatus";

import type { NavbarProps, Theme } from "./typing";
import { useTheme } from "./useTheme";

function Navbar({ className, children, user, extra }: NavbarProps) {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { theme, changeTheme } = useTheme();

  const themeLabels: Record<Theme, string> = {
    system: "System Mode",
    light: "Light Mode",
    dark: "Dark Mode",
  };

  return (
    <div className={clsx("flex items-center justify-between w-full px-4 py-2 sm:px-6 lg:px-8", className)}>
      <div className="flex item-center gap-4">
        <Link className="flex items-center gap-2" title="Back to home" to="/">
          <BrandLogo width={isDesktop ? 32 : 24} />
          {!isMobile && (
            <span className="text-sm font-bold text-gray-800 dark:text-gray-300">
              {getTitle()}
            </span>
          )}
        </Link>
        {extra}
      </div>
      <div className="flex items-center gap-4">
        {children}
        <AuthStatus user={user} />
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
      </div>
    </div>
  );
}

export default Navbar;

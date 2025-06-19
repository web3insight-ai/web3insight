import clsx from "clsx";
import { Link, useLocation } from "@remix-run/react";

import type { NavMenuProps } from "./typing";
import { getMenu, isMenuItemActive } from "./helper";

function NavMenu({ settings = false }: NavMenuProps) {
  const { pathname } = useLocation();

  return (
    <nav className="flex flex-col gap-2">
      {getMenu(settings).map(item => (
        <Link
          key={item.text}
          className={clsx("block px-4 py-2 text-sm rounded-md text-gray-800 hover:text-gray-600 hover:bg-white/15", { "!bg-white": isMenuItemActive(pathname, item) })}
          to={item.path}
        >
          {item.text}
        </Link>
      ))}
    </nav>
  );
}

export default NavMenu;

import clsx from "clsx";
import { Link, useLocation } from "@remix-run/react";

import { getMenu, isMenuItemActive } from "./helper";

function NavMenu() {
  const { pathname } = useLocation();

  return (
    <nav>
      {getMenu().map(item => (
        <Link
          key={item.text}
          className={clsx("block px-4 py-2 rounded-md text-gray-800 hover:text-gray-600 hover:bg-white/15", { "!bg-white": isMenuItemActive(pathname, item) })}
          to={item.path}
        >
          {item.text}
        </Link>
      ))}
    </nav>
  );
}

export default NavMenu;

import { canManageEcosystems, canManageEvents } from "~/auth/helper";
import type { ApiUser } from "~/auth/typing";

import type { MenuItem } from "./typing";

function prefixPath(partOfPath: string): string {
  return `/admin${partOfPath}`;
}

function buildMenu(user: ApiUser | null): MenuItem[] {
  const menuItems: MenuItem[] = [];

  if (canManageEcosystems(user)) {
    menuItems.push({
      text: "Ecosystems",
      path: "",
      childrenPrefix: "/ecosystems",
    });
  }

  if (canManageEvents(user)) {
    menuItems.push({
      text: "Events", 
      path: "/events",
      childrenPrefix: "/events",
    });
  }

  return menuItems.map(item => ({
    ...item,
    path: prefixPath(item.path),
    childrenPrefix: item.childrenPrefix ? prefixPath(item.childrenPrefix) : undefined,
  }));
}

const settingsMenu: MenuItem[] = [
  {
    text: "Managers",
    path: "/settings",
  },
];

function getMenu(settings: boolean, user?: ApiUser | null) {
  return settings ? settingsMenu : buildMenu(user || null);
}

function isMenuItemActive(path: string, item: MenuItem): boolean {
  return item.path === path || (!!item.childrenPrefix && path.startsWith(item.childrenPrefix));
}

export { getMenu, isMenuItemActive };

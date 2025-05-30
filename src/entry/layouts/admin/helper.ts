import type { MenuItem } from "./typing";

function prefixPath(partOfPath: string): string {
  return `/admin${partOfPath}`;
}

const menu: MenuItem[] = [
  {
    text: "Ecosystems",
    path: "",
    childrenPrefix: "/ecosystems",
  },
].map(item => ({
  ...item,
  path: prefixPath(item.path),
  childrenPrefix: prefixPath(item.childrenPrefix),
}));

function getMenu() {
  return menu;
}

function isMenuItemActive(path: string, item: MenuItem): boolean {
  return item.path === path || (!!item.childrenPrefix && path.startsWith(item.childrenPrefix));
}

export { getMenu, isMenuItemActive };

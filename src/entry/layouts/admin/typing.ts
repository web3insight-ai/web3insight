import type { User } from "~/strapi/typing";

type MenuItem = {
  text: string;
  path: string;
  childrenPrefix?: string;
};

type AdminLayoutProps = {
  user: User | null;
  settings?: boolean;
};

type NavMenuProps = Pick<AdminLayoutProps, "settings">;

export type { MenuItem, AdminLayoutProps, NavMenuProps };

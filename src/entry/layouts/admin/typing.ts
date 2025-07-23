import type { ApiUser } from "~/auth/typing";

type MenuItem = {
  text: string;
  path: string;
  childrenPrefix?: string;
};

type AdminLayoutProps = {
  user: ApiUser | null;
  settings?: boolean;
};

type NavMenuProps = Pick<AdminLayoutProps, "settings" | "user">;

export type { MenuItem, AdminLayoutProps, NavMenuProps };

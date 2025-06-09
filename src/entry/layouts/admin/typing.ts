import type { User } from "~/strapi/typing";

type MenuItem = {
  text: string;
  path: string;
  childrenPrefix?: string;
};

type AdminLayoutProps = {
  user: User | null;
};

export type { MenuItem, AdminLayoutProps };

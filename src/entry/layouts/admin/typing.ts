import type { StrapiUser } from "~/strapi/typing";

type MenuItem = {
  text: string;
  path: string;
  childrenPrefix?: string;
};

type AdminLayoutProps = {
  user: StrapiUser | null;
};

export type { MenuItem, AdminLayoutProps };

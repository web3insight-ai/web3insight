import type { User } from "~/strapi/typing";

type DefaultLayoutProps = {
  children: React.ReactNode;
  user: User | null;
};

export type { DefaultLayoutProps };

import type { PropsWithChildren, ReactNode } from "react";

import type { User } from "~/strapi/typing";

type NavbarProps = PropsWithChildren<{
  className?: string;
  user: User | null;
  extra?: ReactNode;
}>;

type Theme = "light" | "dark" | "system";

export type { NavbarProps, Theme };

import type { PropsWithChildren, ReactNode } from "react";

import type { StrapiUser } from "~/strapi/typing";

type NavbarProps = PropsWithChildren<{
  className?: string;
  user: StrapiUser | null;
  extra?: ReactNode;
}>;

type Theme = "light" | "dark" | "system";

export type { NavbarProps, Theme };

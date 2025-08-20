import type { PropsWithChildren, ReactNode } from "react";

import type { ApiUser } from "~/auth/typing";

type NavbarProps = PropsWithChildren<{
  className?: string;
  user: ApiUser | null;
  extra?: ReactNode;
}>;

type Theme = "light" | "dark" | "system";

export type { NavbarProps, Theme };

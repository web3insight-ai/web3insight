import type { ApiUser } from "~/auth/typing";

type DefaultLayoutProps = {
  children: React.ReactNode;
  user: ApiUser | null;
};

export type { DefaultLayoutProps };

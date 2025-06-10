import type { RoleType, User as StrapiUser } from "../strapi/typing";

type User = Pick<StrapiUser, "username" | "email"> & {
  id: StrapiUser["id"];
  role: RoleType;
};

type Manager = User & {
  ecosystems: string[];
};

export type { Manager };

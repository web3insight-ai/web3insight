import type { RoleType, ApiUser } from "../auth/typing";

type User = Pick<ApiUser, "username" | "email"> & {
  id: ApiUser["id"];
  role: RoleType;
};

type Manager = User & {
  ecosystems: string[];
};

export type { Manager };

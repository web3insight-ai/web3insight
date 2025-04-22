interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { StrapiUser };
export type { DataValue, ListValue } from "@handie/runtime-core";

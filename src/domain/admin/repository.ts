import type { ResponseResult } from "@/types";

import { fetchUserList, fetchUser } from "../strapi/repository";

import type { Manager } from "./typing";
import { isRoleManageable, resolveManager } from "./helper";

async function fetchManagerList(): Promise<ResponseResult<Manager[]>> {
  const { data, ...rest } = await fetchUserList({ populate: "role" });

  return {
    ...rest,
    data: data
      .filter(user => isRoleManageable(user.role.type))
      .map(resolveManager),
  };
}

async function fetchManager(id: Manager["id"]): Promise<ResponseResult<Manager | undefined>> {
  const { data, ...rest } = await fetchUser(id, { populate: "role" });

  return {
    ...rest,
    data: data ? resolveManager(data) : undefined,
  };
}

export { fetchManagerList, fetchManager };

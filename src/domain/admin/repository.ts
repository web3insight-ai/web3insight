import type { ResponseResult } from "@/types";
import { isServerSide } from "@/clients/http";
import httpClient from "@/clients/http/default";

import type { User } from "../strapi/typing";
import { fetchUserList, fetchUser, updateUser } from "../strapi/repository";

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

async function updateManager(manager: Manager): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.put("/api/admin/manager", manager);
  }

  return updateUser({ id: manager.id, ecosystem: manager.ecosystems.join(",") } as User);
}

export { fetchManagerList, fetchManager, updateManager };

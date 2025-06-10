import type { ResponseResult } from "@/types";

import { fetchUserList } from "../strapi/repository";
import { isManageable } from "../auth/helper";

import type { User } from "./typing";

async function fetchList(params = {}): Promise<ResponseResult<User[]>> {
  return fetchUserList(params);
}

async function fetchManagerList(): Promise<ResponseResult<User[]>> {
  const { data, ...rest } = await fetchUserList({ populate: "role" });

  return {
    ...rest,
    data: data.filter(user => isManageable(user)),
  };
}

export { fetchList, fetchManagerList };

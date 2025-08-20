import type { ResponseResult } from "@/types";

import type { Manager } from "./typing";

// TODO: Implement admin functions using the new API
async function fetchManagerList(): Promise<ResponseResult<Manager[]>> {
  return {
    success: false,
    code: "501",
    data: [],
    message: "Admin functions not yet implemented with new API",
  };
}

async function fetchManager(id: Manager["id"]): Promise<ResponseResult<Manager | undefined>> {
  return {
    success: false,
    code: "501", 
    data: undefined,
    message: `Admin functions not yet implemented with new API (id: ${id})`,
  };
}

async function updateManager(manager: Manager): Promise<ResponseResult> {
  return {
    success: false,
    code: "501",
    message: `Admin functions not yet implemented with new API (manager: ${manager.username})`,
  };
}

export { fetchManagerList, fetchManager, updateManager };

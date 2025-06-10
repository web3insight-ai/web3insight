import type { ResponseResult } from "@/types";
import { generateFailedResponse } from "@/clients/http";

import type { User } from "../typing";
import httpClient from "./client";

// Get current user data
async function getCurrentUser(token: string): Promise<ResponseResult<User | undefined>> {
  try {
    return httpClient.get("/users/me", {
      params: { populate: "*" },
      headers: { "Authorization": `Bearer ${token}` },
    });
  } catch (error) {
    return generateFailedResponse("An error occurred while fetch current user");
  }
}

async function fetchUserList(params = {}): Promise<ResponseResult<User[]>> {
  return httpClient.get("/users", { params });
}

export { getCurrentUser, fetchUserList };

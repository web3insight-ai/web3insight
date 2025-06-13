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

async function fetchUser(id: number, params = {}): Promise<ResponseResult<User | undefined>> {
  return httpClient.get(`/users/${id}`, { params });
}

async function updateUser({ id, ...others }: User): Promise<ResponseResult<User>> {
  return httpClient.put(`/users/${id}`, others);
}

export { getCurrentUser, fetchUserList, fetchUser, updateUser };

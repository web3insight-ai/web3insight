"use client";

import type { ResponseResult } from "@/types";
import type { ApiUser, ApiAuthResponse } from "./typing";

async function apiCall<T>(
  url: string,
  options?: RequestInit,
): Promise<ResponseResult<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res.json();
}

async function signInWithPrivy(
  idToken: string,
): Promise<ResponseResult<ApiAuthResponse>> {
  return apiCall("/api/auth/privy", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

async function signOut(): Promise<ResponseResult> {
  return apiCall("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ clientSide: true }),
  });
}

async function fetchCurrentUser(): Promise<ResponseResult<ApiUser>> {
  return apiCall("/api/auth/me");
}

export { signInWithPrivy, signOut, fetchCurrentUser };

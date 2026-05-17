"use client";

import type { ResponseResult } from "@/types";
import type {
  ApiUser,
  ApiAuthResponse,
  MagicResponse,
  WalletBindResponse,
} from "./typing";

// Helper for API calls
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

// Client-only versions of auth functions that make API calls

async function signInWithGitHub(
  code: string,
): Promise<ResponseResult<ApiAuthResponse>> {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ code, clientSide: true }),
  });
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

async function fetchMagic(): Promise<ResponseResult<MagicResponse>> {
  return apiCall("/api/auth/magic");
}

async function bindWallet(params: {
  signature: string;
  message: string;
  address: string;
}): Promise<ResponseResult<WalletBindResponse>> {
  return apiCall("/api/auth/bind/wallet", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export {
  signInWithGitHub,
  signInWithPrivy,
  signOut,
  fetchCurrentUser,
  fetchMagic,
  bindWallet,
};

'use client';

import type { ResponseResult } from "@/types";
import httpClient from "@/clients/http/default";

import type { ApiUser, ApiAuthResponse, MagicResponse, WalletBindResponse } from "./typing";

// Client-only versions of auth functions that make API calls

async function signInWithGitHub(code: string): Promise<ResponseResult<ApiAuthResponse>> {
  return httpClient.post("/api/auth/login", { code, clientSide: true });
}

async function signInWithPrivy(idToken: string): Promise<ResponseResult<ApiAuthResponse>> {
  return httpClient.post("/api/auth/privy", { idToken });
}

async function signOut(): Promise<ResponseResult> {
  return httpClient.post("/api/auth/logout", { clientSide: true });
}

async function fetchCurrentUser(): Promise<ResponseResult<ApiUser>> {
  return httpClient.get("/api/auth/me");
}

async function fetchMagic(): Promise<ResponseResult<MagicResponse>> {
  return httpClient.get("/api/auth/magic");
}

async function bindWallet(params: { signature: string; message: string; address: string }): Promise<ResponseResult<WalletBindResponse>> {
  return httpClient.post("/api/auth/bind/wallet", params);
}

export {
  signInWithGitHub,
  signInWithPrivy,
  signOut,
  fetchCurrentUser,
  fetchMagic,
  bindWallet,
};

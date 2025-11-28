import { httpClient } from "@/lib/http-client"
import { ResponseResult, ApiAuthResponse, ApiUser, UpdateUserProfileRequest } from "@/types/api"

export async function signInWithPrivy(idToken: string): Promise<ResponseResult<ApiAuthResponse>> {
  return httpClient.post("/api/auth/privy", { idToken })
}

export async function signOut(): Promise<ResponseResult> {
  return httpClient.post("/api/auth/logout")
}

export async function getCurrentUser(): Promise<ResponseResult<ApiUser | null>> {
  return httpClient.get("/api/auth/me")
}

export async function getUserById(userId: string): Promise<ResponseResult<ApiUser | null>> {
  return httpClient.get(`/api/auth/user/${userId}`)
}

export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<ResponseResult<ApiUser>> {
  return httpClient.put("/api/auth/profile", data)
}

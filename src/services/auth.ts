import { httpClient } from "@/lib/http-client"
import { ResponseResult, ApiAuthResponse, ApiUser, UpdateUserProfileRequest } from "@/types/api"

export async function signInWithPrivy(idToken: string): Promise<ResponseResult<ApiAuthResponse>> {
  return httpClient.post("/api/auth/privy", { idToken })
}

export async function signOut(): Promise<ResponseResult> {
  return httpClient.post("/api/auth/logout")
}

export async function getCurrentUser(
  ecosystem?: "monad" | "mantle"
): Promise<ResponseResult<ApiUser | null>> {
  const url = ecosystem ? `/api/auth/me?ecosystem=${ecosystem}` : "/api/auth/me"
  return httpClient.get(url)
}

export async function getUserById(userId: string): Promise<ResponseResult<ApiUser | null>> {
  return httpClient.get(`/api/auth/user/${userId}`)
}

export async function getUserByIdAndEcosystem(
  ecosystem: "monad" | "mantle",
  userId: string
): Promise<ResponseResult<ApiUser | null>> {
  return httpClient.get(`/api/auth/user/${ecosystem}/${userId}`)
}

export async function updateUserProfileByEcosystem(
  ecosystem: "monad" | "mantle",
  data: UpdateUserProfileRequest
): Promise<ResponseResult<ApiUser>> {
  return httpClient.post(`/api/auth/profile/${ecosystem}`, data)
}

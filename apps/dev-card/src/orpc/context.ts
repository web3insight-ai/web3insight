import { cookies } from "next/headers"
import { env } from "@/env"

export interface ORPCContext {
  authToken: string | null
  dataApiUrl: string
  twitterApiUrl: string
}

export async function createContext(): Promise<ORPCContext> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get("auth-token")?.value ?? null

  return {
    authToken,
    dataApiUrl: env.DATA_API_URL,
    twitterApiUrl: env.TWITTER_API_URL,
  }
}

import { createWeb3InsightClient } from "@web3insight/orpc-client"
import { cookies } from "next/headers"
import { env } from "@/env"

/**
 * Server-side oRPC client → backend Hono `/rpc/*`.
 *
 * Used inside dev-card's Next.js oRPC procedures (src/orpc/router.ts) to call
 * the backend's typed contracts directly instead of hitting REST URLs.
 *
 * If `explicitToken` is supplied, it overrides the cookie lookup. This is
 * needed inside `signInWithPrivy` where the new auth-token is in the response
 * body but hasn't been written back to the cookie store yet.
 */
export function createBackendClient(explicitToken?: string | null) {
  return createWeb3InsightClient({
    url: `${env.DATA_API_URL}/rpc`,
    // Reason: dev-card is a server-to-server consumer of the backend RPC.
    // Don't forward browser cookies; we attach the JWT ourselves.
    credentials: "omit",
    token: explicitToken
      ? explicitToken
      : async () => {
          const store = await cookies()
          return store.get("auth-token")?.value
        },
  })
}

export type BackendClient = ReturnType<typeof createBackendClient>["client"]

import type { RouterClient } from "@orpc/server"
import { RPCLink } from "@orpc/client/fetch"
import { createORPCClient } from "@orpc/client"
import type { router } from "./router"

const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      // Server-side: use absolute URL
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
      return `${baseUrl}/api/rpc`
    }
    return `${window.location.origin}/api/rpc`
  },
})

export const orpcClient: RouterClient<typeof router> = createORPCClient(link)

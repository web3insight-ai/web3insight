"use client"

import { createORPCClient, onError } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import type { RouterClient } from "@orpc/server"
import type { AppRouter } from "./router"

// Create RPC link for fetch requests
const link = new RPCLink({
  url: () => {
    if (typeof window === "undefined") {
      throw new Error("RPCLink is not allowed on the server side.")
    }
    return `${window.location.origin}/api/rpc`
  },
  interceptors: [
    onError((error) => {
      console.error("[oRPC Client Error]:", error)
    }),
  ],
})

// Create the oRPC client
export const client: RouterClient<AppRouter> = createORPCClient(link)

// Create TanStack Query utilities for React components
export const orpc = createTanstackQueryUtils(client)

"use client";

import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@/env";

/**
 * Typed RPC client + TanStack Query utils for dashboard.
 *
 * Talks to the Hono oRPC handler at `${DATA_API_URL}/rpc` in apps/api.
 * All 47 procedures defined in @web3insight/api-contract are live there;
 * legacy REST endpoints under /v1, /v2 only exist as an OpenAPIHandler
 * compatibility shim for external consumers — in-repo callers always use
 * this client.
 */
const { client, orpc, link } = createWeb3InsightClient({
  url: `${env.DATA_API_URL}/rpc`,
  token: () => {
    if (typeof document === "undefined") return undefined;
    // Reason: js-cookie isn't bundled here; we only need read-access to one
    // cookie at request time, and the regex is contained to this one helper.
    const match = document.cookie.match(/(?:^|; )auth-token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  },
  timeoutMs: env.HTTP_TIMEOUT,
});

export { client, orpc, link };

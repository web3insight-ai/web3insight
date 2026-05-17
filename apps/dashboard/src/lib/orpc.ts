"use client";

import { createWeb3InsightClient } from "@web3insight/orpc-client";
import { env } from "@/env";

/**
 * Typed RPC client + TanStack Query utils for dashboard.
 * URL points to the NestJS oRPC handler at /rpc/* in apps/api.
 *
 * Migration: prefer this over the legacy `src/lib/api/client.ts` (REST fetch) for
 * any endpoint whose contract is implemented in `apps/api/src/rpc/handlers/`.
 * Stub procedures will throw NOT_IMPLEMENTED until migrated.
 */
const { client, orpc, link } = createWeb3InsightClient({
  url: `${env.DATA_API_URL}/rpc`,
  token: () => {
    if (typeof document === "undefined") return undefined;
    const match = document.cookie.match(/(?:^|; )auth-token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  },
  timeoutMs: env.HTTP_TIMEOUT,
});

export { client, orpc, link };

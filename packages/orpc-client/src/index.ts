import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { ContractRouterClient } from '@orpc/contract';
import type { Contract } from '@web3insight/api-contract';

/** Type alias for the typed RPC client matching the root contract. */
export type Web3InsightClient = ContractRouterClient<Contract>;

export interface CreateClientOptions {
  /** Absolute or relative URL to the RPC handler (e.g. `https://api.web3insight.ai/rpc`). */
  url: string;
  /** Optional auth token. If provided, sent as `Authorization: Bearer <token>`. */
  token?: string | (() => string | undefined | Promise<string | undefined>);
  /** Per-request fetch timeout in ms (default 30s). */
  timeoutMs?: number;
  /** Include credentials (cookies). Default true for cookie-based auth. */
  credentials?: RequestCredentials;
  /** Extra request headers (static or callback). */
  headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
}

const DEFAULT_TIMEOUT_MS = 30_000;

async function resolveToken(token: CreateClientOptions['token']): Promise<string | undefined> {
  if (typeof token === 'function') return await token();
  return token;
}

async function resolveHeaders(headers: CreateClientOptions['headers']): Promise<HeadersInit | undefined> {
  if (!headers) return undefined;
  if (typeof headers === 'function') return await headers();
  return headers;
}

/**
 * Create a typed oRPC client + TanStack Query utils bound to the Web3Insight contract.
 *
 * Usage in a Next.js app:
 * ```ts
 * import { createWeb3InsightClient } from '@web3insight/orpc-client';
 * import { env } from '@/env';
 *
 * export const { client, orpc } = createWeb3InsightClient({
 *   url: `${env.DATA_API_URL}/rpc`,
 *   token: () => getCookie('auth-token'),
 * });
 *
 * // in a component:
 * const { data } = useQuery(orpc.total.repos.queryOptions({ input: { eco_name: 'all' } }));
 * ```
 */
export function createWeb3InsightClient(options: CreateClientOptions) {
  const { url, token, timeoutMs = DEFAULT_TIMEOUT_MS, credentials = 'include', headers } = options;

  const link = new RPCLink({
    url,
    headers: async () => {
      const baseHeaders = await resolveHeaders(headers);
      const baseObj: Record<string, string> = baseHeaders
        ? (baseHeaders instanceof Headers
            ? Object.fromEntries(baseHeaders.entries())
            : Array.isArray(baseHeaders)
              ? Object.fromEntries(baseHeaders)
              : { ...baseHeaders } as Record<string, string>)
        : {};
      const tokenValue = await resolveToken(token);
      if (tokenValue) {
        baseObj.Authorization = `Bearer ${tokenValue}`;
      }
      return baseObj;
    },
    fetch: (request, init) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const initOptions = init as RequestInit | undefined;
      const upstreamSignal = initOptions?.signal ?? undefined;
      const signal = upstreamSignal
        ? AbortSignal.any([controller.signal, upstreamSignal])
        : controller.signal;
      return globalThis
        .fetch(request, { ...(initOptions ?? {}), signal, credentials })
        .finally(() => clearTimeout(timer));
    },
  });

  const client = createORPCClient(link) as Web3InsightClient;
  const orpc = createTanstackQueryUtils(client);

  return { client, orpc, link };
}

export type { Contract } from '@web3insight/api-contract';

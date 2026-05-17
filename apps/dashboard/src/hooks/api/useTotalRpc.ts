'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { STATS_CACHE_OPTIONS } from '@web3insight/query-keys';

/**
 * Sample oRPC-backed hook — calls apps/api's `total.repos` handler via
 * `@web3insight/orpc-client`. Demonstrates end-to-end typed RPC in dashboard.
 *
 * Migration path: replace existing TanStack Query hooks in `src/hooks/api/`
 * one-by-one with their oRPC equivalents using the same pattern.
 */
export function useTotalReposRpc(ecoName: string = 'all') {
  return useQuery({
    ...orpc.total.repos.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useTotalActorsRpc(ecoName: string = 'all', scope: 'all' | 'core' = 'all') {
  return useQuery({
    ...orpc.total.actors.queryOptions({ input: { eco_name: ecoName, scope } }),
    ...STATS_CACHE_OPTIONS,
  });
}

export function useTotalEcosystemsRpc() {
  return useQuery({
    ...orpc.total.ecosystems.queryOptions({ input: {} }),
    ...STATS_CACHE_OPTIONS,
  });
}

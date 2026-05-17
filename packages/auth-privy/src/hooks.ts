'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import type { Web3InsightClient } from '@web3insight/orpc-client';

export interface UsePrivyAuthSyncOptions {
  /** RPC client used to exchange Privy id_token → backend JWT. */
  client: Pick<Web3InsightClient, 'auth'>;
  /** Called after exchange succeeds; persist the JWT here (e.g., to cookie). */
  onTokenReceived: (token: string) => void | Promise<void>;
  /** Called on exchange failure. */
  onError?: (error: unknown) => void;
}

/**
 * Exchange a Privy id token for a backend JWT whenever Privy auth changes.
 * Consolidates the duplicate logic from dashboard's PrivyAuthSync and dev-card's useAuth.
 */
export function usePrivyAuthSync({ client, onTokenReceived, onError }: UsePrivyAuthSyncOptions) {
  const { authenticated, user, getAccessToken, ready } = usePrivy();
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState<unknown>(null);

  const sync = useCallback(async () => {
    if (!authenticated || !user) return;
    try {
      setSyncing(true);
      const idToken = await getAccessToken();
      if (!idToken) throw new Error('Privy access token unavailable');
      const result = await client.auth.privyTokenAuth({ id_token: idToken });
      await onTokenReceived(result.token);
      setLastError(null);
    } catch (err) {
      setLastError(err);
      onError?.(err);
    } finally {
      setSyncing(false);
    }
  }, [authenticated, user, getAccessToken, client, onTokenReceived, onError]);

  useEffect(() => {
    if (!ready) return;
    if (authenticated && user) {
      void sync();
    }
  }, [ready, authenticated, user, sync]);

  return { syncing, lastError, sync, ready, authenticated };
}

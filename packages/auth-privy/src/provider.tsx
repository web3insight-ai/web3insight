'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';

export interface PrivyAuthProviderProps {
  appId: string;
  children: ReactNode;
  /** Privy login methods (default: github + google + wallet). */
  loginMethods?: Array<'github' | 'google' | 'wallet' | 'email' | 'sms' | 'discord' | 'twitter' | 'apple' | 'farcaster'>;
  /** Branding overrides. */
  appearance?: {
    logo?: string;
    theme?: 'light' | 'dark';
    accentColor?: `#${string}`;
  };
}

const DEFAULT_LOGIN_METHODS: PrivyAuthProviderProps['loginMethods'] = ['github', 'google', 'wallet'];

/**
 * Shared Privy provider used by dashboard + dev-card.
 * Wraps `@privy-io/react-auth`'s PrivyProvider with sensible defaults.
 */
export function PrivyAuthProvider({
  appId,
  children,
  loginMethods = DEFAULT_LOGIN_METHODS,
  appearance,
}: PrivyAuthProviderProps) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods,
        appearance: {
          theme: appearance?.theme ?? 'light',
          accentColor: appearance?.accentColor ?? '#0EA5E9',
          logo: appearance?.logo,
        },
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}

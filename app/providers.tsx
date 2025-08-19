'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';
import { Provider as JotaiProvider } from 'jotai';
import { WalletProvider } from '@/providers/WalletProvider';
import NavigationProgress from '$/NavigationProgress';
import ClientOnly from '$/ClientOnly';

export function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JotaiProvider>
      <NextUIProvider>
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientOnly>
            <WalletProvider>
              <NavigationProgress />
              {children}
            </WalletProvider>
          </ClientOnly>
        </ThemeProvider>
      </NextUIProvider>
    </JotaiProvider>
  );
}

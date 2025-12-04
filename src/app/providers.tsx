"use client";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";

import NavigationProgress from "$/NavigationProgress";
import ClientOnly from "$/ClientOnly";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { PrivyAuthSync } from "@/providers/PrivyAuthSync";
import { QueryProvider } from "@/providers/QueryProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <JotaiProvider>
        <PrivyProvider>
          <PrivyAuthSync />
          <NextUIProvider>
            <ThemeProvider
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ClientOnly>
                <NavigationProgress />
                {children}
              </ClientOnly>
            </ThemeProvider>
          </NextUIProvider>
        </PrivyProvider>
      </JotaiProvider>
    </QueryProvider>
  );
}

"use client";

import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";

import NavigationProgress from "$/NavigationProgress";
import ClientOnly from "$/ClientOnly";
import ToastContainer from "$/ToastContainer";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { PrivyProvider } from "@/providers/PrivyProvider";
import { PrivyAuthSync } from "@/providers/PrivyAuthSync";
import { QueryProvider } from "@/providers/QueryProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <JotaiProvider>
          <PrivyProvider>
            <PrivyAuthSync />
            <ThemeProvider
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ClientOnly>
                <NavigationProgress />
                <ToastContainer />
                {children}
              </ClientOnly>
            </ThemeProvider>
          </PrivyProvider>
        </JotaiProvider>
      </QueryProvider>
    </NuqsAdapter>
  );
}

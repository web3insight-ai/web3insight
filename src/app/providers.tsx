"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { Provider as JotaiProvider } from "jotai";

import NavigationProgress from "$/NavigationProgress";
import ClientOnly from "$/ClientOnly";
import ToastContainer from "$/ToastContainer";

const AIAssistantWidget = dynamic(() => import("$/AIAssistantWidget"), {
  ssr: false,
});
import { PrivyProvider } from "@/providers/PrivyProvider";
import { PrivyAuthSync } from "@/providers/PrivyAuthSync";
import { QueryProvider } from "@/providers/QueryProvider";
import { AIAssistantProvider } from "@/providers/AssistantRuntimeProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
              <AIAssistantProvider>
                <AIAssistantWidget />
              </AIAssistantProvider>
              <ToastContainer />
              {children}
            </ClientOnly>
          </ThemeProvider>
        </PrivyProvider>
      </JotaiProvider>
    </QueryProvider>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { isServerSide } from "@/clients/http";

import { getWagmiConfig } from "@/config/wagmi";
import { OriginProvider } from "./OriginProvider";

// Import RainbowKit styles
import "@rainbow-me/rainbowkit/styles.css";

// Function to create QueryClient with SSR-safe configuration
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Disable retries on server side to prevent indexedDB issues
        retry: !isServerSide(),
      },
      mutations: {
        // Disable retries on server side
        retry: !isServerSide(),
      },
    },
  });
}

// Create QueryClient instance only on client side
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { resolvedTheme } = useTheme();
  const [wagmiConfig, setWagmiConfig] = useState<ReturnType<typeof getWagmiConfig>>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the query client instance
  const queryClient = getQueryClient();

  // Initialize wagmi config on client side only
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const config = getWagmiConfig();
      setWagmiConfig(config);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const rainbowKitTheme =
    resolvedTheme === "dark"
      ? darkTheme({
        accentColor: "#007cee", // Primary blue from NextUI theme
        accentColorForeground: "white",
        borderRadius: "medium",
        fontStack: "system",
        overlayBlur: "small",
      })
      : lightTheme({
        accentColor: "#007cee", // Primary blue from NextUI theme
        accentColorForeground: "white",
        borderRadius: "medium",
        fontStack: "system",
        overlayBlur: "small",
      });

  // Always provide QueryClient, but only add WagmiProvider and RainbowKitProvider when config is ready
  if (!wagmiConfig || !isInitialized) {
    return (
      <QueryClientProvider client={queryClient}>
        <OriginProvider>{children}</OriginProvider>
      </QueryClientProvider>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          modalSize="compact"
          showRecentTransactions={true}
        >
          <OriginProvider>{children}</OriginProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

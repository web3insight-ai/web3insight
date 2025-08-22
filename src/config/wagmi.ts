import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { supportedChains } from "./chains";
import { env } from "@/env";

// Cache for wagmi config to prevent multiple WalletConnect Core initializations
let _wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;

// Lazy initialization function that only runs on client side
export function createWagmiConfig() {
  // Always return null on server side to prevent indexedDB issues
  if (typeof window === "undefined") {
    return null;
  }

  // Return cached config if already created
  if (_wagmiConfig) {
    return _wagmiConfig;
  }

  try {
    _wagmiConfig = getDefaultConfig({
      appName: "Web3Insight",
      projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      chains: supportedChains,
      ssr: true, // Enable server-side rendering support
      // Client-side storage only
      storage: window.localStorage,
    });

    return _wagmiConfig;
  } catch (error) {
    console.warn("Failed to create wagmi config:", error);
    return null;
  }
}

// Export a getter function instead of direct config export
export function getWagmiConfig() {
  return createWagmiConfig();
}

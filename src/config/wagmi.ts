import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { supportedChains } from "./chains";
import { env } from "@/env";

// Create config only once to prevent multiple WalletConnect Core initializations
let _wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;

function createWagmiConfig() {
  if (_wagmiConfig) {
    return _wagmiConfig;
  }

  _wagmiConfig = getDefaultConfig({
    appName: "Web3Insight",
    projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    chains: supportedChains,
    ssr: true, // Enable server-side rendering support
    // Add storage configuration to handle SSR properly
    storage:
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage
        : null,
  });

  return _wagmiConfig;
}

export const wagmiConfig = createWagmiConfig();

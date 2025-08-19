import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains } from './chains';
import { getVar } from '@/utils/env';

// Get WalletConnect project ID from environment using the project's env system
const projectId = getVar('WALLETCONNECT_PROJECT_ID') || 'project_id';

if (!getVar('WALLETCONNECT_PROJECT_ID')) {
  console.warn('WALLETCONNECT_PROJECT_ID environment variable not set. Using fallback project ID.');
}

// Create config only once to prevent multiple WalletConnect Core initializations
let _wagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;

function createWagmiConfig() {
  if (_wagmiConfig) {
    return _wagmiConfig;
  }

  _wagmiConfig = getDefaultConfig({
    appName: 'Web3Insight',
    projectId,
    chains: supportedChains,
    ssr: true, // Enable server-side rendering support
    // Add storage configuration to handle SSR properly
    storage: typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined,
  });

  return _wagmiConfig;
}

export const wagmiConfig = createWagmiConfig();

export default wagmiConfig;

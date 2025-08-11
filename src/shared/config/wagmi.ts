import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains } from './chains';
import { getVar } from '@/utils/env';

// Get WalletConnect project ID from environment using the project's env system
const projectId = getVar('WALLETCONNECT_PROJECT_ID') || 'project_id';

if (!getVar('WALLETCONNECT_PROJECT_ID')) {
  console.warn('WALLETCONNECT_PROJECT_ID environment variable not set. Using fallback project ID.');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Web3Insight',
  projectId,
  chains: supportedChains,
  ssr: true, // Enable server-side rendering support
});

export default wagmiConfig;

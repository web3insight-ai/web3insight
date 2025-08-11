import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { supportedChains } from './chains';
import { getVar } from '@/utils/env';

// Get WalletConnect project ID from environment
const projectId = getVar('WALLETCONNECT_PROJECT_ID') || 'project_id';

export const wagmiConfig = getDefaultConfig({
  appName: 'Web3Insight',
  projectId,
  chains: supportedChains,
  ssr: true, // Enable server-side rendering support
});

export default wagmiConfig;

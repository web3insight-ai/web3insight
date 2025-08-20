import { mainnet, sepolia } from 'viem/chains';

// Export commonly used chains
export { mainnet, sepolia };

// Custom chain configurations can be added here
// For now, we'll primarily use Ethereum mainnet for production
export const supportedChains = [mainnet, sepolia] as const;

// Default chain for the application
export const defaultChain = mainnet;

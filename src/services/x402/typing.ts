/**
 * x402 Donate Domain Types
 *
 * Re-exports types from the API layer and adds domain-specific types.
 */

// Re-export API types
export type {
  DonateRepo,
  DonateRepoInfo,
  DonationConfig,
} from "@/lib/api/types";

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "submitting"
  | "success"
  | "error";

export interface PaymentRecipient {
  address: string;
  basisPoints: number;
}

export interface PaymentParams {
  amount: string;
  payTo: string;
  recipients?: PaymentRecipient[];
  network?: string;
}

export interface PaymentResult {
  txHash: string;
  amount: string;
  recipient: string;
  network: string;
}

// ============================================================================
// UI Types
// ============================================================================

export interface DonateRepoCardProps {
  repo: import("@/lib/api/types").DonateRepo;
  onDonate?: () => void;
}

export interface SubmitRepoFormProps {
  onSuccess?: (repo: import("@/lib/api/types").DonateRepo) => void;
  onError?: (error: string) => void;
}

export interface GenerateConfigFormProps {
  defaultValues?: Partial<import("@/lib/api/types").DonationConfig>;
}

export interface DonateButtonProps {
  payTo: string;
  title?: string;
  defaultAmount?: number;
  recipients?: PaymentRecipient[];
  network?: string;
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const PRESET_AMOUNTS = [1, 5, 10, 25] as const;

export const SUPPORTED_NETWORKS = [
  { value: "base", label: "Base", chainId: 8453, isTestnet: false },
  {
    value: "base-sepolia",
    label: "Base Sepolia",
    chainId: 84532,
    isTestnet: true,
  },
] as const;

export const DEFAULT_NETWORK = "base";

export type NetworkKey = (typeof SUPPORTED_NETWORKS)[number]["value"];

// USDC contract addresses per network
export const USDC_ADDRESSES: Record<NetworkKey, `0x${string}`> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

// Chain IDs per network
export const CHAIN_IDS: Record<NetworkKey, number> = {
  base: 8453,
  "base-sepolia": 84532,
};

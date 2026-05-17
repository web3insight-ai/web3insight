/**
 * x402 Donate Domain Types
 *
 * Re-exports types from the API layer and adds domain-specific types.
 */

import type { Address, Hex } from "viem";

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
// x402 EIP-3009 Types
// ============================================================================

/**
 * EIP-3009 TransferWithAuthorization parameters
 */
export interface X402Authorization {
  from: Address;
  to: Address;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: Hex;
}

/**
 * x402 payment payload structure
 */
export interface X402PaymentPayload {
  x402Version: number;
  scheme: "exact";
  network: string;
  payload: {
    signature: Hex;
    authorization: {
      from: Address;
      to: Address;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: Hex;
    };
  };
}

/**
 * x402 payment requirements
 */
export interface X402PaymentRequirements {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  extra?: {
    name: string;
    version: string;
    address: string;
  };
}

/**
 * Facilitator settlement response
 */
export interface X402SettlementResponse {
  success: boolean;
  transaction?: string;
  txHash?: string;
  network?: string;
  payer?: string;
  errorReason?: string | null;
}

// ============================================================================
// USDC EIP-712 Domain Types
// ============================================================================

export interface USDCDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Address;
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

// x402 v2 uses CAIP-2 network identifiers
export const SUPPORTED_NETWORKS = [
  {
    value: "base",
    caip2: "eip155:8453",
    label: "Base",
    chainId: 8453,
    isTestnet: false,
  },
  {
    value: "base-sepolia",
    caip2: "eip155:84532",
    label: "Base Sepolia",
    chainId: 84532,
    isTestnet: true,
  },
] as const;

export const DEFAULT_NETWORK = "base";

export type NetworkKey = (typeof SUPPORTED_NETWORKS)[number]["value"];
export type NetworkCaip2 = (typeof SUPPORTED_NETWORKS)[number]["caip2"];

/**
 * Get CAIP-2 network identifier from network key
 */
export function getNetworkCaip2(network: NetworkKey): NetworkCaip2 {
  const found = SUPPORTED_NETWORKS.find((n) => n.value === network);
  if (!found) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return found.caip2;
}

/**
 * Get chain ID from network key
 */
export function getNetworkChainId(network: NetworkKey): number {
  const found = SUPPORTED_NETWORKS.find((n) => n.value === network);
  if (!found) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return found.chainId;
}

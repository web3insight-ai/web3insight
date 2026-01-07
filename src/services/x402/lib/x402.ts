/**
 * x402 Client Utilities
 *
 * Wrapper around @x402x/client and @x402x/extensions for consistent usage.
 * Compatible with Privy wallet integration.
 */

import type { Address } from "viem";
import { X402Client } from "@x402x/client";
import {
  TransferHook,
  parseDefaultAssetAmount as parseAmount,
  formatDefaultAssetAmount as formatAmount,
  getNetworkConfig,
} from "@x402x/extensions";

// x402 Facilitator URL
const FACILITATOR_URL = "https://facilitator.x402x.dev";

// Split type from @x402x/extensions (not exported, so we define it here)
export interface Split {
  recipient: Address;
  bips: number;
}

// Reason: Using 'any' for wallet type to avoid viem version conflicts between project and @x402x/client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWalletClient = any;

/**
 * Create an x402 client instance (synchronous in v2)
 *
 * @param wallet - viem WalletClient (extended with publicActions)
 * @param network - CAIP-2 network identifier (e.g., "eip155:84532")
 * @returns X402Client instance
 */
export function createX402Client(
  wallet: AnyWalletClient,
  network: string,
): InstanceType<typeof X402Client> {
  // Reason: x402 v2 uses CAIP-2 network identifiers and synchronous client creation
  return new X402Client({
    wallet,
    network,
    facilitatorUrl: FACILITATOR_URL,
    timeout: 30000,
    confirmationTimeout: 60000,
  });
}

/**
 * Parse USD amount to atomic units (USDC has 6 decimals)
 * Re-exported from @x402x/extensions
 */
export const parseDefaultAssetAmount = parseAmount;

/**
 * Format atomic units to USD amount
 * Re-exported from @x402x/extensions
 */
export const formatDefaultAssetAmount = formatAmount;

/**
 * Convert percentage to basis points (bips)
 * 1% = 100 bips, 100% = 10000 bips
 */
export function percentageToBips(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Convert basis points to percentage
 */
export function bipsToPercentage(bips: number): number {
  return bips / 100;
}

/**
 * Get TransferHook contract address for a network
 *
 * @param network - CAIP-2 network identifier or network alias
 * @returns TransferHook contract address
 */
export function getTransferHookAddress(network: string): Address {
  return TransferHook.getAddress(network) as Address;
}

/**
 * Encode hookData for TransferHook
 *
 * @param splits - Optional array of split configurations
 * @returns Encoded hookData as hex string
 */
export function encodeTransferHookData(splits?: Split[]): `0x${string}` {
  return TransferHook.encode(splits) as `0x${string}`;
}

/**
 * Recipient configuration for distributed transfers
 */
export interface Recipient {
  address: Address;
  basisPoints: number;
}

/**
 * Encode recipients for TransferHook
 *
 * @param recipients - Array of recipients with address and basisPoints
 * @returns Encoded hookData
 */
export function encodeRecipientsForHook(
  recipients: Recipient[],
): `0x${string}` {
  if (!recipients || recipients.length === 0) {
    return TransferHook.encode() as `0x${string}`;
  }

  const splits: Split[] = recipients
    .filter((r) => r.basisPoints > 0)
    .map((r) => ({
      recipient: r.address,
      bips: r.basisPoints,
    }));

  return TransferHook.encode(splits) as `0x${string}`;
}

/**
 * Get primary recipient address (first recipient or fallback)
 */
export function getPrimaryRecipient(
  recipients: Recipient[],
  fallback: Address = "0x0000000000000000000000000000000000000000",
): Address {
  if (!recipients || recipients.length === 0) {
    return fallback;
  }
  return recipients[0].address;
}

/**
 * Validate recipient configuration
 * Ensures total basis points don't exceed 10000 (100%)
 */
export function validateRecipientConfig(recipients: Recipient[]): {
  valid: boolean;
  error?: string;
} {
  if (!recipients || recipients.length === 0) {
    return { valid: true };
  }

  const totalBips = recipients.reduce((sum, r) => sum + r.basisPoints, 0);

  if (totalBips > 10000) {
    return {
      valid: false,
      error: `Total basis points (${totalBips}) exceeds 10000 (100%)`,
    };
  }

  return { valid: true };
}

/**
 * Get network configuration from @x402x/extensions
 */
export { getNetworkConfig };

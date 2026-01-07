"use client";

import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, type Address, publicActions } from "viem";
import { base, baseSepolia } from "viem/chains";
import {
  createX402Client,
  parseDefaultAssetAmount,
  getTransferHookAddress,
  encodeRecipientsForHook,
  getPrimaryRecipient,
  validateRecipientConfig,
  type Recipient,
} from "../lib/x402";
import type {
  PaymentStatus,
  PaymentParams,
  PaymentResult,
  NetworkKey,
} from "../typing";
import { DEFAULT_NETWORK, getNetworkCaip2, getNetworkChainId } from "../typing";

/**
 * Get viem chain from network key
 */
function getChainFromNetwork(network: NetworkKey) {
  return network === "base" ? base : baseSepolia;
}

export interface UseX402PaymentOptions {
  network?: NetworkKey;
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for x402 payment integration with Privy wallet
 * Uses official @x402x/client for gasless USDC payments
 */
export function useX402Payment(options?: UseX402PaymentOptions) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  // Get the active wallet (prefer Privy embedded wallet)
  const getActiveWallet = useCallback(() => {
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    const externalWallet = wallets.find((w) => w.walletClientType !== "privy");
    return embeddedWallet || externalWallet;
  }, [wallets]);

  const execute = useCallback(
    async ({
      amount,
      payTo,
      recipients,
      network = options?.network || DEFAULT_NETWORK,
    }: PaymentParams) => {
      const wallet = getActiveWallet();

      if (!wallet) {
        const errorMsg = "Please connect a wallet first";
        setError(errorMsg);
        setStatus("error");
        options?.onError?.(errorMsg);
        return null;
      }

      // Validate payTo address
      if (!payTo || !/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
        const errorMsg = "Invalid recipient address";
        setError(errorMsg);
        setStatus("error");
        options?.onError?.(errorMsg);
        return null;
      }

      // Validate recipient configuration if provided
      if (recipients && recipients.length > 0) {
        const recipientList: Recipient[] = recipients.map((r) => ({
          address: r.address as Address,
          basisPoints: r.basisPoints,
        }));
        const validation = validateRecipientConfig(recipientList);
        if (!validation.valid) {
          const errorMsg =
            validation.error || "Invalid recipient configuration";
          setError(errorMsg);
          setStatus("error");
          options?.onError?.(errorMsg);
          return null;
        }
      }

      try {
        setStatus("preparing");
        setError(null);
        setResult(null);

        const networkKey = network as NetworkKey;
        const chain = getChainFromNetwork(networkKey);
        const targetChainId = getNetworkChainId(networkKey);
        const caip2Network = getNetworkCaip2(networkKey);

        // Get wallet provider
        const provider = await wallet.getEthereumProvider();

        // Check current chain and switch if needed
        const currentChainIdHex = await provider.request({
          method: "eth_chainId",
        });
        const currentChainId = parseInt(currentChainIdHex as string, 16);

        if (currentChainId !== targetChainId) {
          try {
            await wallet.switchChain(targetChainId);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (_switchError) {
            const networkName = networkKey === "base" ? "Base" : "Base Sepolia";
            throw new Error(`Please switch to ${networkName} network`);
          }
        }

        // Create viem clients from Privy provider
        const updatedProvider = await wallet.getEthereumProvider();

        // Get the wallet address first
        // Reason: x402xClient requires wallet client to have an account set
        const accounts = (await updatedProvider.request({
          method: "eth_accounts",
        })) as Address[];

        const address = accounts[0];
        if (!address) {
          throw new Error("Could not get wallet address");
        }

        // Create wallet client with account and extend with public actions (required for x402x client)
        const walletClient = createWalletClient({
          account: address,
          chain,
          transport: custom(updatedProvider),
        }).extend(publicActions);

        // Parse amount to atomic units using x402x extensions
        const atomicAmount = parseDefaultAssetAmount(amount, caip2Network);

        setStatus("signing");

        // Create x402 client (synchronous in v2)
        const client = createX402Client(walletClient, caip2Network);

        // Prepare hook data
        const recipientList: Recipient[] =
          recipients?.map((r) => ({
            address: r.address as Address,
            basisPoints: r.basisPoints,
          })) || [];

        const hookData = encodeRecipientsForHook(recipientList);
        const primaryRecipient =
          recipients && recipients.length > 0
            ? getPrimaryRecipient(recipientList, payTo as Address)
            : (payTo as Address);

        setStatus("submitting");

        // Execute payment using official x402x client
        const executeResult = await client.execute({
          hook: getTransferHookAddress(caip2Network),
          hookData,
          amount: atomicAmount,
          payTo: primaryRecipient,
        });

        const paymentResult: PaymentResult = {
          txHash: executeResult.txHash,
          amount,
          recipient: payTo,
          network,
        };

        setResult(paymentResult);
        setStatus("success");
        options?.onSuccess?.(paymentResult);
        return paymentResult;
      } catch (err) {
        let errorMessage = "Payment failed";
        if (err instanceof Error) {
          const msg = err.message.toLowerCase();
          if (msg.includes("rejected") || msg.includes("denied")) {
            errorMessage = "User rejected the request";
          } else if (msg.includes("insufficient") || msg.includes("balance")) {
            // Reason: Facilitator returns insufficient balance error including fee
            errorMessage =
              "Insufficient USDC balance (including ~10% facilitator fee)";
          } else if (msg.includes("timeout")) {
            errorMessage = "Transaction timed out. Please try again.";
          } else if (msg.includes("network") || msg.includes("chain")) {
            errorMessage = err.message;
          } else {
            // Clean up error message by removing docs links and extra info
            errorMessage = err.message.split("Docs:")[0]?.trim() || err.message;
            // Truncate very long error messages
            if (errorMessage.length > 100) {
              errorMessage = errorMessage.slice(0, 100) + "...";
            }
          }
        }
        setError(errorMessage);
        setStatus("error");
        options?.onError?.(errorMessage);
        return null;
      }
    },
    [getActiveWallet, options],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    execute,
    reset,
    status,
    error,
    result,
    isConnected: ready && authenticated && wallets.length > 0,
    activeWallet: getActiveWallet(),
  };
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerUrl(txHash: string, network: string): string {
  if (network === "base-sepolia") {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }
  return `https://basescan.org/tx/${txHash}`;
}

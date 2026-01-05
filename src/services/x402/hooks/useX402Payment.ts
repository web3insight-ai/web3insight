"use client";

import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, parseUnits, type Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import type {
  PaymentStatus,
  PaymentParams,
  PaymentResult,
  NetworkKey,
} from "../typing";
import { USDC_ADDRESSES, CHAIN_IDS, DEFAULT_NETWORK } from "../typing";

/**
 * Hook for x402 payment integration with Privy wallet
 */
export function useX402Payment() {
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
    async ({ amount, payTo, network = DEFAULT_NETWORK }: PaymentParams) => {
      const wallet = getActiveWallet();

      if (!wallet) {
        setError("No wallet connected. Please connect a wallet first.");
        setStatus("error");
        return null;
      }

      // Validate payTo address
      if (!payTo || !/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
        setError("Invalid recipient address");
        setStatus("error");
        return null;
      }

      try {
        setStatus("preparing");
        setError(null);
        setResult(null);

        // Get the chain based on network
        const networkKey = network as NetworkKey;
        const chain = networkKey === "base" ? base : baseSepolia;
        const targetChainId = CHAIN_IDS[networkKey];
        const usdcAddress = USDC_ADDRESSES[networkKey];

        if (!usdcAddress || !targetChainId) {
          throw new Error(`Unsupported network: ${network}`);
        }

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
            // Small delay to ensure chain switch is complete
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (_switchError) {
            const networkName = networkKey === "base" ? "Base" : "Base Sepolia";
            throw new Error(
              `Please switch to ${networkName} network in your wallet`,
            );
          }
        }

        // Create viem wallet client (re-get provider after chain switch)
        const updatedProvider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          chain,
          transport: custom(updatedProvider),
        });

        // Get the wallet address
        const [address] = await walletClient.getAddresses();
        if (!address) {
          throw new Error("Could not get wallet address");
        }

        setStatus("signing");

        // Parse amount to USDC atomic units (6 decimals)
        const amountInAtomicUnits = parseUnits(amount, 6);

        // For now, we'll do a simple ERC20 transfer
        // In production, this would use the x402 protocol's execute flow
        // with the @x402x/client library
        const txHash = await walletClient.writeContract({
          address: usdcAddress,
          abi: [
            {
              name: "transfer",
              type: "function",
              inputs: [
                { name: "to", type: "address" },
                { name: "value", type: "uint256" },
              ],
              outputs: [{ type: "bool" }],
            },
          ],
          functionName: "transfer",
          args: [payTo as Address, amountInAtomicUnits],
          account: address,
        });

        setStatus("submitting");

        // Wait a moment for the transaction to be submitted
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const paymentResult: PaymentResult = {
          txHash,
          amount,
          recipient: payTo,
          network,
        };

        setResult(paymentResult);
        setStatus("success");
        return paymentResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        setStatus("error");
        return null;
      }
    },
    [getActiveWallet],
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

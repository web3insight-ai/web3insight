"use client";

import { useState, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseUnits,
  formatUnits,
  type Address,
  type Hex,
} from "viem";
import { base, baseSepolia } from "viem/chains";
import type {
  PaymentStatus,
  PaymentParams,
  PaymentResult,
  NetworkKey,
  X402Authorization,
  X402PaymentPayload,
} from "../typing";
import {
  USDC_ADDRESSES,
  CHAIN_IDS,
  DEFAULT_NETWORK,
  USDC_DOMAINS,
} from "../typing";

// x402 Facilitator URL
const FACILITATOR_URL = "https://facilitator.x402x.dev";

// ERC20 balanceOf ABI
const ERC20_BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/**
 * Generate a random nonce for EIP-3009
 */
function generateNonce(): Hex {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `0x${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as Hex;
}

/**
 * Hook for x402 payment integration with Privy wallet
 * Uses EIP-3009 transferWithAuthorization for gasless USDC payments
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
        setError("Please connect a wallet first");
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
        const usdcDomain = USDC_DOMAINS[networkKey];

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
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (_switchError) {
            const networkName = networkKey === "base" ? "Base" : "Base Sepolia";
            throw new Error(`Please switch to ${networkName} network`);
          }
        }

        // Create clients
        const updatedProvider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          chain,
          transport: custom(updatedProvider),
        });

        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        // Get the wallet address
        const [address] = await walletClient.getAddresses();
        if (!address) {
          throw new Error("Could not get wallet address");
        }

        // Parse amount to USDC atomic units (6 decimals)
        const amountInAtomicUnits = parseUnits(amount, 6);

        // Check USDC balance before signing
        const balance = await publicClient.readContract({
          address: usdcAddress,
          abi: ERC20_BALANCE_ABI,
          functionName: "balanceOf",
          args: [address],
        });

        if (balance < amountInAtomicUnits) {
          const balanceFormatted = formatUnits(balance, 6);
          throw new Error(
            `Insufficient USDC balance. You have ${balanceFormatted} USDC, need ${amount} USDC`,
          );
        }

        setStatus("signing");

        // Create EIP-3009 authorization
        const validAfter = Math.floor(Date.now() / 1000);
        const validBefore = validAfter + 3600; // Valid for 1 hour
        const nonce = generateNonce();

        const authorization: X402Authorization = {
          from: address,
          to: payTo as Address,
          value: amountInAtomicUnits.toString(),
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce,
        };

        // EIP-712 typed data for TransferWithAuthorization
        const typedData = {
          domain: usdcDomain,
          types: {
            TransferWithAuthorization: [
              { name: "from", type: "address" },
              { name: "to", type: "address" },
              { name: "value", type: "uint256" },
              { name: "validAfter", type: "uint256" },
              { name: "validBefore", type: "uint256" },
              { name: "nonce", type: "bytes32" },
            ],
          },
          primaryType: "TransferWithAuthorization" as const,
          message: {
            from: authorization.from,
            to: authorization.to,
            value: BigInt(authorization.value),
            validAfter: BigInt(authorization.validAfter),
            validBefore: BigInt(authorization.validBefore),
            nonce: authorization.nonce,
          },
        };

        // Sign the typed data (gasless - user only signs)
        const signature = await walletClient.signTypedData({
          account: address,
          ...typedData,
        });

        setStatus("submitting");

        // Create x402 payment payload
        const paymentPayload: X402PaymentPayload = {
          x402Version: 1,
          scheme: "exact",
          network: networkKey === "base" ? "base" : "base-sepolia",
          payload: {
            signature,
            authorization: {
              from: authorization.from,
              to: authorization.to,
              value: authorization.value,
              validAfter: authorization.validAfter,
              validBefore: authorization.validBefore,
              nonce: authorization.nonce,
            },
          },
        };

        // Send to facilitator for settlement
        const facilitatorResponse = await fetch(`${FACILITATOR_URL}/settle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentPayload,
            paymentRequirements: {
              scheme: "exact",
              network: paymentPayload.network,
              maxAmountRequired: authorization.value,
              resource: `donate:${payTo}`,
              description: "Donation via x402",
              mimeType: "application/json",
              payTo: payTo,
              extra: {
                name: usdcDomain.name,
                version: usdcDomain.version,
                address: usdcAddress,
              },
            },
          }),
        });

        const responseText = await facilitatorResponse.text();
        let settlementResult;

        try {
          settlementResult = JSON.parse(responseText);
        } catch {
          console.error("Facilitator response:", responseText);
          throw new Error("Invalid facilitator response");
        }

        if (!facilitatorResponse.ok) {
          throw new Error(
            settlementResult?.error ||
              settlementResult?.message ||
              `Facilitator error: ${facilitatorResponse.status}`,
          );
        }

        if (!settlementResult.success) {
          throw new Error(
            settlementResult.errorReason ||
              settlementResult.error ||
              "Settlement failed",
          );
        }

        const txHash = settlementResult.transaction || settlementResult.txHash;
        if (!txHash) {
          console.error("Settlement result:", settlementResult);
          throw new Error("No transaction hash returned");
        }

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
        let errorMessage = "Payment failed";
        if (err instanceof Error) {
          if (
            err.message.includes("rejected") ||
            err.message.includes("denied")
          ) {
            errorMessage = "User rejected the request";
          } else if (err.message.includes("Insufficient")) {
            errorMessage = err.message;
          } else {
            errorMessage = err.message.split("Docs:")[0]?.trim() || err.message;
          }
        }
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

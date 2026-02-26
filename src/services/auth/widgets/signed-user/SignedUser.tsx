"use client";

import {
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Chip,
} from "@/components/ui";
import {
  LogIn,
  LogOut,
  User,
  Layers,
  Calendar,
  Wallet,
  Copy,
  Check,
  Shield,
} from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import type { SignedUserProps } from "./typing";
import type { ApiUser } from "../../typing";
import ActionItem from "./ActionItem";
import {
  canManageEcosystems,
  canManageEvents,
  getPrivyUserDisplayInfo,
} from "../../helper";

// Chain ID to name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  84532: "Base Sepolia",
  10: "Optimism",
  42161: "Arbitrum",
  137: "Polygon",
};

function SignedUser({ onSignIn }: SignedUserProps) {
  const { ready, authenticated, user: privyUser, logout } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [backendUser, setBackendUser] = useState<ApiUser | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Get the Privy embedded wallet
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const walletAddress = embeddedWallet?.address;

  // Fetch current chain ID
  useEffect(() => {
    if (!embeddedWallet) {
      setCurrentChainId(null);
      return;
    }

    const fetchChainId = async () => {
      try {
        const provider = await embeddedWallet.getEthereumProvider();
        const chainIdHex = await provider.request({ method: "eth_chainId" });
        const chainId = parseInt(chainIdHex as string, 16);
        setCurrentChainId(chainId);
      } catch {
        setCurrentChainId(null);
      }
    };

    fetchChainId();
  }, [embeddedWallet]);

  // Fetch backend user data
  useEffect(() => {
    if (!authenticated) {
      setBackendUser(null);
      return;
    }

    // Fetch user data from backend
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBackendUser(data.data);
        }
      })
      .catch(() => {
        // Silent error handling
      });
  }, [authenticated]);

  const handleCopyAddress = useCallback(async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent error
    }
  }, [walletAddress]);

  // Only show if Privy is authenticated
  const isPrivyAuthenticated = ready && authenticated && privyUser;

  if (isPrivyAuthenticated) {
    // Extract user display info from Privy based on login method
    const userInfo = getPrivyUserDisplayInfo(privyUser);
    const displayName = userInfo.displayName;
    const avatarUrl = userInfo.avatarUrl || backendUser?.avatar_url;
    const firstLetter = displayName.substring(0, 1).toUpperCase();

    // Check user roles from backend
    const isAdmin =
      backendUser?.role?.allowed_roles?.includes("admin") || false;
    const canManageEco = canManageEcosystems(backendUser);
    const canManageEvt = canManageEvents(backendUser);

    const handleLogout = async () => {
      try {
        // Logout from Privy
        await logout();

        // Clear backend session
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Redirect and refresh
        router.push("/");
        router.refresh();
      } catch {
        // Still redirect even if there's an error
        router.push("/");
        router.refresh();
      }
    };

    const truncatedAddress = walletAddress
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : null;

    const chainName = currentChainId
      ? CHAIN_NAMES[currentChainId] || `Chain ${currentChainId}`
      : null;

    return (
      <Popover placement="bottom-end">
        <PopoverTrigger>
          <Avatar
            src={avatarUrl}
            name={firstLetter}
            size="sm"
            className="cursor-pointer"
            color="primary"
            isBordered
            as="button"
          />
        </PopoverTrigger>
        <PopoverContent
          className="p-0 rounded-lg bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark"
          style={{ width: "240px" }}
        >
          <div className="flex flex-col">
            {/* User info section */}
            <div className="px-4 py-3 border-b border-border dark:border-border-dark bg-gray-50 dark:bg-surface-elevated rounded-t-lg">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {userInfo.primaryAccount}
              </p>
            </div>

            {/* Wallet section */}
            {truncatedAddress && (
              <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Privy Wallet</span>
                  </div>
                  {chainName && (
                    <Chip size="sm" variant="flat" className="text-xs h-5">
                      {chainName}
                    </Chip>
                  )}
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1.5 text-sm font-mono text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  {truncatedAddress}
                  {copied ? (
                    <Check size={12} className="text-green-500" />
                  ) : (
                    <Copy size={12} className="text-gray-400" />
                  )}
                </button>
              </div>
            )}

            {/* Menu items */}
            <div className="py-2">
              <ActionItem
                text="Profile"
                icon={User}
                action="/profile"
                renderType="link"
              />

              {canManageEco && (
                <ActionItem
                  text="Ecosystem Manager"
                  icon={Layers}
                  action="/admin/ecosystems"
                  renderType="link"
                />
              )}

              {canManageEvt && (
                <ActionItem
                  text="Event Manager"
                  icon={Calendar}
                  action="/admin/events"
                  renderType="link"
                />
              )}

              {isAdmin && (
                <ActionItem
                  text="Admin Panel"
                  icon={Shield}
                  action="/admin"
                  renderType="link"
                />
              )}
            </div>

            {/* Logout button */}
            <div className="p-2 border-t border-border dark:border-border-dark">
              <Button
                fullWidth
                size="sm"
                color="danger"
                variant="flat"
                startContent={<LogOut size={16} />}
                onPress={handleLogout}
                className="justify-start"
              >
                Logout
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      onClick={() => onSignIn()}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
    >
      <LogIn size={16} />
      Sign In
    </button>
  );
}

export default SignedUser;

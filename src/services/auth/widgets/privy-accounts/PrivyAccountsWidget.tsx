"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { usePrivy } from "@privy-io/react-auth";
import {
  Github,
  Mail,
  Wallet,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface PrivyAccountsWidgetProps {
  className?: string;
}

export function PrivyAccountsWidget({
  className = "",
}: PrivyAccountsWidgetProps) {
  const {
    user,
    linkEmail,
    linkWallet,
    linkGoogle,
    linkGithub,
    unlinkEmail,
    unlinkWallet,
  } = usePrivy();
  const [linkingType, setLinkingType] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const linkedAccounts = user.linkedAccounts || [];

  // Group accounts by type
  const emailAccounts = linkedAccounts.filter((acc) => acc.type === "email");
  const walletAccounts = linkedAccounts.filter((acc) => acc.type === "wallet");
  const githubAccounts = linkedAccounts.filter(
    (acc) => acc.type === "github_oauth",
  );
  const googleAccounts = linkedAccounts.filter(
    (acc) => acc.type === "google_oauth",
  );

  const handleLinkEmail = async () => {
    setLinkingType("email");
    try {
      await linkEmail();
    } catch {
      // Error handled by Privy UI
    } finally {
      setLinkingType(null);
    }
  };

  const handleLinkWallet = async () => {
    setLinkingType("wallet");
    try {
      await linkWallet();
    } catch {
      // Error handled by Privy UI
    } finally {
      setLinkingType(null);
    }
  };

  const handleLinkGithub = async () => {
    setLinkingType("github");
    try {
      await linkGithub();
    } catch {
      // Error handled by Privy UI
    } finally {
      setLinkingType(null);
    }
  };

  const handleLinkGoogle = async () => {
    setLinkingType("google");
    try {
      await linkGoogle();
    } catch {
      // Error handled by Privy UI
    } finally {
      setLinkingType(null);
    }
  };

  const handleUnlinkEmail = async (email: string) => {
    setUnlinkingId(email);
    try {
      await unlinkEmail(email);
    } catch {
      // Error handled by Privy UI
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleUnlinkWallet = async (address: string) => {
    setUnlinkingId(address);
    try {
      await unlinkWallet(address);
    } catch {
      // Error handled by Privy UI
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className={className}>
      {/* Connected Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* GitHub Accounts */}
        {githubAccounts.map((account) => (
          <div
            key={account.address || account.email}
            className="flex items-center justify-between p-4 bg-bg-sunken border border-rule rounded-[2px]"
          >
            <div className="flex items-center gap-3">
              <Github size={20} className="text-fg" />
              <div>
                <p className="text-sm font-medium text-fg">GitHub</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-fg-muted">
                    {account.username || account.email || "Connected"}
                  </p>
                  <CheckCircle size={14} className="text-fg-muted" />
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-bg-raised text-fg text-[10px] font-mono uppercase tracking-[0.12em] rounded-[2px] border border-rule">
              Verified
            </div>
          </div>
        ))}

        {/* Google Accounts */}
        {googleAccounts.map((account) => (
          <div
            key={account.email}
            className="flex items-center justify-between p-4 bg-bg-sunken border border-rule rounded-[2px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-fg">Google</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-fg-muted">{account.email}</p>
                  <CheckCircle size={14} className="text-fg-muted" />
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-bg-raised text-fg text-[10px] font-mono uppercase tracking-[0.12em] rounded-[2px] border border-rule">
              Verified
            </div>
          </div>
        ))}

        {/* Email Accounts */}
        {emailAccounts.map((account) => (
          <div
            key={account.address}
            className="flex items-center justify-between p-4 bg-bg-sunken border border-rule rounded-[2px]"
          >
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-fg" />
              <div>
                <p className="text-sm font-medium text-fg">Email</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-fg-muted">{account.address}</p>
                  <CheckCircle size={14} className="text-fg-muted" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-bg-raised text-fg text-[10px] font-mono uppercase tracking-[0.12em] rounded-[2px] border border-rule">
                Verified
              </div>
              {emailAccounts.length > 1 && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleUnlinkEmail(account.address)}
                  isLoading={unlinkingId === account.address}
                >
                  {unlinkingId === account.address ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* Wallet Accounts */}
        {walletAccounts.map((account) => (
          <div
            key={account.address}
            className="flex items-center justify-between p-4 bg-bg-sunken border border-rule rounded-[2px]"
          >
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-fg" />
              <div>
                <p className="text-sm font-medium text-fg">
                  Wallet {account.walletClient === "privy" && "(Embedded)"}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-fg-muted">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                  <CheckCircle size={14} className="text-fg-muted" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-bg-raised text-fg text-[10px] font-mono uppercase tracking-[0.12em] rounded-[2px] border border-rule">
                Connected
              </div>
              {walletAccounts.length > 1 &&
                account.walletClient !== "privy" && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleUnlinkWallet(account.address)}
                  isLoading={unlinkingId === account.address}
                >
                  {unlinkingId === account.address ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* No connected accounts message */}
        {linkedAccounts.length === 0 && (
          <div className="col-span-full">
            <p className="text-sm text-fg-muted text-center py-4">
              No connected accounts
            </p>
          </div>
        )}
      </div>

      {/* Add Account Buttons - Only show unlinked account types */}
      {(emailAccounts.length === 0 ||
        walletAccounts.length === 0 ||
        githubAccounts.length === 0 ||
        googleAccounts.length === 0) && (
        <div className="pt-4 border-t border-rule">
          <p className="text-sm font-medium text-fg mb-3">
            Link Additional Accounts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {emailAccounts.length === 0 && (
              <Button
                variant="bordered"
                size="sm"
                startContent={<Mail size={16} />}
                onPress={handleLinkEmail}
                isLoading={linkingType === "email"}
                fullWidth
                className="justify-center"
              >
                Email
              </Button>
            )}
            {walletAccounts.length === 0 && (
              <Button
                variant="bordered"
                size="sm"
                startContent={<Wallet size={16} />}
                onPress={handleLinkWallet}
                isLoading={linkingType === "wallet"}
                fullWidth
                className="justify-center"
              >
                Wallet
              </Button>
            )}
            {githubAccounts.length === 0 && (
              <Button
                variant="bordered"
                size="sm"
                startContent={<Github size={16} />}
                onPress={handleLinkGithub}
                isLoading={linkingType === "github"}
                fullWidth
                className="justify-center"
              >
                GitHub
              </Button>
            )}
            {googleAccounts.length === 0 && (
              <Button
                variant="bordered"
                size="sm"
                startContent={
                  <div className="w-4 h-4 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                }
                onPress={handleLinkGoogle}
                isLoading={linkingType === "google"}
                fullWidth
                className="justify-center"
              >
                Google
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

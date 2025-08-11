import { useState } from 'react';
import { Button, Card, CardBody, Chip, Divider } from '@nextui-org/react';
import { useAccount, useSignMessage } from 'wagmi';
import { Wallet, Check, AlertCircle, Loader2, Plus } from 'lucide-react';

import { ConnectButton } from '@/components/wallet/ConnectButton';
import type { ApiUser } from '~/auth/typing';

interface WalletBindWidgetProps {
  user: ApiUser;
  onBindSuccess?: () => void;
  className?: string;
}

export function WalletBindWidget({ user, onBindSuccess, className = '' }: WalletBindWidgetProps) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isBinding, setIsBinding] = useState(false);
  const [bindError, setBindError] = useState<string | null>(null);
  const [bindSuccess, setBindSuccess] = useState(false);

  // Get existing wallet binds
  const walletBinds = user.binds?.filter(bind => bind.bind_type === 'wallet') || [];
  const isAddressAlreadyBound = address && walletBinds.some(bind => bind.bind_key.toLowerCase() === address.toLowerCase());

  const handleBindWallet = async () => {
    if (!address || !isConnected) {
      setBindError('Please connect your wallet first');
      return;
    }

    if (isAddressAlreadyBound) {
      setBindError('This wallet address is already bound to your account');
      return;
    }

    setIsBinding(true);
    setBindError(null);
    setBindSuccess(false);

    try {
      // Step 1: Fetch magic string
      const magicResponse = await fetch('/api/auth/magic', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!magicResponse.ok) {
        const errorData = await magicResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch magic string: ${magicResponse.status}`);
      }

      const magicData = await magicResponse.json();
      const magic = magicData.magic;

      if (!magic) {
        throw new Error('Magic string not found in response');
      }

      // Step 2: Sign the magic string
      const signature = await signMessageAsync({
        message: magic,
      });

      // Step 3: Submit binding request
      const bindResponse = await fetch('/api/auth/bind/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          address,
          magic,
          signature,
        }),
      });

      if (!bindResponse.ok) {
        const errorData = await bindResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to bind wallet: ${bindResponse.status}`);
      }

      const bindData = await bindResponse.json();

      if (!bindData.success && bindData.success !== undefined) {
        throw new Error(bindData.message || 'Failed to bind wallet');
      }

      setBindSuccess(true);
      onBindSuccess?.();

      // Reload the page to update user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Wallet binding error:', error);
      setBindError(error instanceof Error ? error.message : 'Failed to bind wallet');
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <Card className={`bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet size={20} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wallet Address
          </h2>
        </div>

        {/* Existing wallet addresses */}
        {walletBinds.length > 0 && (
          <div className="space-y-3 mb-6">
            {walletBinds.map((bind, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-gray-700 dark:text-gray-300" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                      {bind.bind_key}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ethereum Address
                    </p>
                  </div>
                </div>
                <Chip color="success" variant="flat" size="sm">
                  Connected
                </Chip>
              </div>
            ))}
            <Divider />
          </div>
        )}

        {/* Wallet connection and binding */}
        <div className="space-y-4">
          {!isConnected ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect your wallet to bind it to your account
              </p>
              <ConnectButton
                size="md"
                variant="bordered"
                className="mx-auto"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current connected wallet info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <Check size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Wallet Connected
                  </span>
                </div>
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">
                  {address}
                </p>
              </div>

              {/* Bind button */}
              {isAddressAlreadyBound ? (
                <div className="text-center">
                  <Chip color="success" variant="flat" size="lg">
                    This wallet is already bound
                  </Chip>
                </div>
              ) : (
                <Button
                  onClick={handleBindWallet}
                  disabled={isBinding}
                  color="primary"
                  variant="solid"
                  size="md"
                  startContent={
                    isBinding ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )
                  }
                  className="w-full"
                >
                  {isBinding ? 'Binding Wallet...' : 'Bind This Wallet'}
                </Button>
              )}

              {/* Status messages */}
              {bindError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-800 dark:text-red-300">
                    {bindError}
                  </span>
                </div>
              )}

              {bindSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-300">
                    Wallet bound successfully! Refreshing page...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Binding your wallet allows you to prove ownership of blockchain addresses
            and access wallet-specific features. You&apos;ll need to sign a message to confirm ownership.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

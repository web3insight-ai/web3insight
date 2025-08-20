import { useState } from 'react';
import { Button } from '@nextui-org/react';
import { useAccount, useSignMessage } from 'wagmi';
import { Wallet, Check, AlertCircle, Loader2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

import { ConnectButton } from '$/wallet/ConnectButton';
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
  const isDifferentWalletConnected = isConnected && address && walletBinds.length > 0 && !isAddressAlreadyBound;

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

  // Render bound wallets (always show if any exist)
  if (walletBinds.length > 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Show bound wallets */}
        {walletBinds.map((walletBind, index) => {
          const isBoundAddressConnected = isConnected && address && walletBind.bind_key.toLowerCase() === address.toLowerCase();
          
          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Wallet
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {walletBind.bind_key.slice(0, 6)}...{walletBind.bind_key.slice(-4)}
                    </p>
                    <CheckCircle size={14} className="text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              </div>
              {isBoundAddressConnected ? (
                <div className="px-3 py-1.5 bg-gray-100 dark:bg-surface-elevated text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-border-dark">
                  Connected
                </div>
              ) : (
                <ConnectButton size="sm" variant="bordered" />
              )}
            </div>
          );
        })}
        
        {/* Show different wallet warning if connected to different address */}
        {isDifferentWalletConnected && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle size={16} className="text-orange-600" />
            <div className="flex-1">
              <span className="text-sm text-orange-800 dark:text-orange-300">
                Connected wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) is different from your bound addresses.
              </span>
            </div>
            <Button
              onClick={handleBindWallet}
              disabled={isBinding}
              color="warning"
              variant="flat"
              size="sm"
              startContent={
                isBinding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )
              }
            >
              {isBinding ? 'Binding...' : 'Bind New'}
            </Button>
          </div>
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
              Wallet bound successfully!
            </span>
          </div>
        )}
      </div>
    );
  }

  // No wallets bound - show connect/bind flow
  return (
    <div className={`${className}`}>
      {!isConnected ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg">
          <div className="flex items-center gap-3">
            <Wallet size={20} className="text-gray-700 dark:text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Wallet
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Connect your wallet to bind to account
              </p>
            </div>
          </div>
          <ConnectButton size="sm" variant="bordered" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-surface-elevated rounded-lg">
            <div className="flex items-center gap-3">
              <Check size={20} className="text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Wallet Connected
                </p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleBindWallet}
              disabled={isBinding}
              color="primary"
              variant="flat"
              size="sm"
              startContent={
                isBinding ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )
              }
            >
              {isBinding ? 'Binding...' : 'Bind Wallet'}
            </Button>
          </div>

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
                Wallet bound successfully!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

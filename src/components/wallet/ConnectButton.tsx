import { Button } from '@nextui-org/react';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, WalletMinimal, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CustomConnectButtonProps {
  showBalance?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

function useRainbowKitReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we're on client side and if RainbowKit context is available
    if (typeof window !== 'undefined') {
      // Small delay to allow RainbowKit to initialize
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return isReady;
}

export function ConnectButton({
  showBalance = false,
  size = 'md',
  variant = 'solid',
  color = 'primary',
  className = '',
}: CustomConnectButtonProps) {
  const isRainbowKitReady = useRainbowKitReady();

  // Fallback button when RainbowKit is not available
  if (!isRainbowKitReady) {
    return (
      <Button
        size={size}
        variant={variant}
        color={color}
        startContent={<Wallet size={18} />}
        className={className}
        disabled
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    size={size}
                    variant={variant}
                    color={color}
                    startContent={<Wallet size={18} />}
                    className={className}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    size={size}
                    variant="bordered"
                    color="warning"
                    className={className}
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex gap-2">
                  {showBalance && (
                    <Button
                      onClick={openAccountModal}
                      size={size}
                      variant="flat"
                      className="font-mono"
                    >
                      {account.displayBalance
                        ? account.displayBalance
                        : ''}
                    </Button>
                  )}
                  
                  <Button
                    onClick={openAccountModal}
                    size={size}
                    variant={variant}
                    color={color}
                    startContent={<WalletMinimal size={16} />}
                    endContent={<ChevronDown size={14} />}
                    className={className}
                  >
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}

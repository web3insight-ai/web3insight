"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
} from "@nextui-org/react";
import { usePrivy } from "@privy-io/react-auth";
import { useAtom } from "jotai";
import {
  Heart,
  Wallet,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Zap,
} from "lucide-react";
import { useX402Payment, getExplorerUrl } from "../hooks/useX402Payment";
import { PRESET_AMOUNTS, DEFAULT_NETWORK, SUPPORTED_NETWORKS } from "../typing";
import type { DonateButtonProps, NetworkKey } from "../typing";
import { addToastAtom } from "#/atoms";

export function DonateButton({
  payTo,
  title,
  defaultAmount,
  recipients,
  network = DEFAULT_NETWORK,
  disabled,
}: DonateButtonProps) {
  const { ready, authenticated, login } = usePrivy();
  const { execute, reset, status, error, result, isConnected, activeWallet } =
    useX402Payment();
  const [, addToast] = useAtom(addToastAtom);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    defaultAmount || null,
  );
  const [customAmount, setCustomAmount] = useState(
    defaultAmount ? defaultAmount.toString() : "",
  );
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkKey>(
    (network as NetworkKey) || DEFAULT_NETWORK,
  );

  // Show toast on status change
  useEffect(() => {
    if (status === "success" && result) {
      addToast({
        type: "success",
        title: "Donation successful!",
        message: `Sent $${result.amount} USDC`,
        link: {
          url: getExplorerUrl(result.txHash, result.network),
          text: "View transaction",
        },
        duration: 8000, // Longer duration to allow clicking the link
      });
    } else if (status === "error" && error) {
      addToast({
        type: "error",
        title: "Donation failed",
        message: error,
      });
    }
  }, [status, result, error, addToast]);

  const handleOpen = () => {
    if (!authenticated) {
      login();
      return;
    }
    setIsOpen(true);
    reset();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedAmount(defaultAmount || null);
    setCustomAmount(defaultAmount ? defaultAmount.toString() : "");
    setSelectedNetwork((network as NetworkKey) || DEFAULT_NETWORK);
    reset();
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleDonate = async () => {
    if (!selectedAmount || !payTo) return;

    await execute({
      amount: selectedAmount.toString(),
      payTo,
      recipients,
      network: selectedNetwork,
    });
  };

  const getStatusContent = () => {
    switch (status) {
    case "preparing":
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Loader2 size={16} className="animate-spin text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
              Preparing authorization...
          </span>
        </div>
      );
    case "signing":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Loader2 size={16} className="animate-spin text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
                Sign the authorization in your wallet...
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 text-xs text-gray-500 dark:text-gray-400">
            <Zap size={12} className="text-green-500" />
            <span>No gas fee required - you only need USDC</span>
          </div>
        </div>
      );
    case "submitting":
      return (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
              Processing payment via x402 facilitator...
          </span>
        </div>
      );
    case "success":
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-300">
                Donation successful!
            </span>
          </div>
          {result && (
            <a
              href={getExplorerUrl(result.txHash, result.network)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
                View transaction
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      );
    case "error":
      return (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle
            size={16}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm text-red-700 dark:text-red-300">
                Transaction failed
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-0.5 line-clamp-2">
              {error?.split("Docs:")[0]?.trim() || "Please try again"}
            </p>
          </div>
        </div>
      );
    default:
      return null;
    }
  };

  const isProcessing = ["preparing", "signing", "submitting"].includes(status);

  return (
    <>
      <Button
        size="sm"
        variant="flat"
        onPress={handleOpen}
        isDisabled={disabled || !ready}
        startContent={<Heart size={14} />}
        className="font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Donate
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} placement="center" size="sm">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-0.5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">
                {title ? `Support ${title}` : "Make a Donation"}
              </span>
              <Chip
                size="sm"
                variant="flat"
                color="success"
                startContent={<Zap size={10} />}
                classNames={{
                  base: "h-5 px-1.5",
                  content: "text-[10px] font-medium",
                }}
              >
                Gasless
              </Chip>
            </div>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              Send USDC on{" "}
              {SUPPORTED_NETWORKS.find((n) => n.value === selectedNetwork)
                ?.label || "Base"}{" "}
              via x402
            </span>
          </ModalHeader>

          <ModalBody className="py-2">
            {status === "idle" && (
              <div className="space-y-4">
                {/* Wallet & Network */}
                <div className="flex items-center gap-2">
                  {isConnected && activeWallet && (
                    <div className="flex-1 flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Wallet size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {activeWallet.address?.slice(0, 6)}...
                        {activeWallet.address?.slice(-4)}
                      </span>
                    </div>
                  )}
                  <Select
                    size="sm"
                    selectedKeys={[selectedNetwork]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as NetworkKey;
                      if (value) setSelectedNetwork(value);
                    }}
                    className="w-36"
                    classNames={{
                      trigger: "bg-gray-50 dark:bg-gray-800 border-0 h-10",
                      value: "text-xs",
                    }}
                    aria-label="Select network"
                  >
                    {SUPPORTED_NETWORKS.map((net) => (
                      <SelectItem key={net.value} textValue={net.label}>
                        <span className="text-xs">{net.label}</span>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Preset Amounts */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Amount (USDC)
                  </span>
                  <div className="flex gap-2">
                    {PRESET_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => handleAmountSelect(amount)}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                          selectedAmount === amount
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <Input
                  type="number"
                  size="sm"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  startContent={
                    <span className="text-gray-400 text-xs">$</span>
                  }
                  endContent={
                    <span className="text-gray-400 text-xs">USDC</span>
                  }
                  classNames={{
                    inputWrapper: "bg-gray-50 dark:bg-gray-800 border-0",
                  }}
                />

                {/* Recipient */}
                <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-xs text-gray-400">To</span>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all mt-0.5">
                    {payTo}
                  </p>
                </div>

                {/* Gasless info */}
                <div className="flex flex-col gap-1.5 p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-green-500" />
                    <span className="text-xs text-green-700 dark:text-green-300">
                      Gasless payment via x402 - only USDC needed
                    </span>
                  </div>
                  <span className="text-[10px] text-green-600/70 dark:text-green-400/70 pl-5">
                    Actual cost may be slightly higher due to facilitator fee
                  </span>
                </div>
              </div>
            )}

            {/* Status Display */}
            {status !== "idle" && getStatusContent()}
          </ModalBody>

          <ModalFooter className="pt-2">
            {status === "idle" && (
              <>
                <Button size="sm" variant="light" onPress={handleClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onPress={handleDonate}
                  isDisabled={!selectedAmount || !isConnected}
                  isLoading={isProcessing}
                >
                  {selectedAmount
                    ? `Donate $${selectedAmount}`
                    : "Select amount"}
                </Button>
              </>
            )}

            {status === "success" && (
              <Button
                size="sm"
                color="primary"
                onPress={handleClose}
                className="w-full"
              >
                Done
              </Button>
            )}

            {status === "error" && (
              <>
                <Button size="sm" variant="light" onPress={handleClose}>
                  Cancel
                </Button>
                <Button size="sm" color="primary" onPress={handleDonate}>
                  Try Again
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

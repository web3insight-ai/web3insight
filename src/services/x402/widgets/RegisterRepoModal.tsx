"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import {
  Github,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Check,
  Download,
  RefreshCw,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  donateRepoSubmitSchema,
  type DonateRepoSubmitInput,
} from "@/lib/form/schemas";
import {
  useSubmitDonateRepo,
  useInvalidateDonateList,
} from "@/hooks/api/useDonate";
import type { DonationConfig, DonateRepo } from "@/lib/api/types";
import {
  SUPPORTED_NETWORKS,
  DEFAULT_NETWORK,
  type NetworkKey,
} from "../typing";

interface RegisterRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "input" | "confirm" | "success";

export function RegisterRepoModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterRepoModalProps) {
  const {
    ready,
    authenticated,
    login,
    user: privyUser,
    linkGithub,
  } = usePrivy();
  const invalidateDonateList = useInvalidateDonateList();

  const githubAccount = privyUser?.linkedAccounts?.find(
    (acc) => acc.type === "github_oauth",
  );
  const githubHandle = githubAccount?.username || null;

  const [currentStep, setCurrentStep] = useState<Step>("input");
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [configCopied, setConfigCopied] = useState(false);

  // Store the checked repo data
  const [checkedRepo, setCheckedRepo] = useState<DonateRepo | null>(null);

  // Config form values for generating config
  const [configValues, setConfigValues] = useState({
    payTo: "",
    title: "",
    description: "",
    defaultAmount: "",
    network: DEFAULT_NETWORK as NetworkKey,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
    getValues,
  } = useForm<DonateRepoSubmitInput>({
    resolver: zodResolver(donateRepoSubmitSchema),
    defaultValues: { repo_full_name: "" },
    mode: "onChange",
  });

  const submitMutation = useSubmitDonateRepo();

  // Check if donation config exists and is valid
  const hasDonationConfig = useCallback(
    (donateData: DonationConfig | null | undefined): boolean => {
      return !!(
        donateData &&
        typeof donateData === "object" &&
        Object.keys(donateData).length > 0 &&
        donateData.payTo
      );
    },
    [],
  );

  // Generated config JSON
  const generatedConfig = useMemo(() => {
    const config: Record<string, unknown> = {};
    if (configValues.payTo) config.payTo = configValues.payTo;
    if (configValues.title) config.title = configValues.title;
    if (configValues.description) config.description = configValues.description;
    if (configValues.defaultAmount) {
      const amount = parseFloat(configValues.defaultAmount);
      if (!isNaN(amount) && amount > 0) config.defaultAmount = amount;
    }
    config.network = configValues.network;
    return JSON.stringify(config, null, 2);
  }, [configValues]);

  const isValidConfig =
    configValues.payTo && /^0x[a-fA-F0-9]{40}$/.test(configValues.payTo);

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setConfigCopied(true);
      setTimeout(() => setConfigCopied(false), 2000);
    } catch {
      // Silent error
    }
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([generatedConfig], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donation.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLinkGithub = async () => {
    setIsLinkingGithub(true);
    try {
      await linkGithub();
    } catch {
      // Error handled by Privy UI
    } finally {
      setIsLinkingGithub(false);
    }
  };

  // Step 1: Check repository
  const handleCheckRepo = async (data: DonateRepoSubmitInput) => {
    setSubmitError(null);

    try {
      const result = await submitMutation.mutateAsync(data);
      const repoData = (result.data ?? result) as DonateRepo;
      const isSuccess = result.success !== false && repoData?.repo_id;

      if (isSuccess && repoData) {
        setCheckedRepo(repoData);

        // Pre-fill config if no donation.json found
        if (!hasDonationConfig(repoData.repo_donate_data)) {
          const repoInfo = repoData.repo_info;
          setConfigValues({
            payTo: "",
            title:
              repoInfo?.full_name?.split("/")[1] ||
              data.repo_full_name.split("/")[1] ||
              "",
            description: repoInfo?.description || "",
            defaultAmount: "",
            network: DEFAULT_NETWORK,
          });
        }

        setCurrentStep("confirm");
      } else if (result.success === false) {
        setSubmitError(result.message || "Failed to check repository");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to check repository",
      );
    }
  };

  // Step 2: Verify (re-check for donation.json)
  const handleVerify = async () => {
    if (!checkedRepo) return;
    setSubmitError(null);

    try {
      const repoName =
        checkedRepo.repo_info?.full_name || getValues("repo_full_name");
      const result = await submitMutation.mutateAsync({
        repo_full_name: repoName,
      });
      const repoData = (result.data ?? result) as DonateRepo;

      if (repoData?.repo_id) {
        setCheckedRepo(repoData);

        if (hasDonationConfig(repoData.repo_donate_data)) {
          // Refetch list and wait for it
          await invalidateDonateList(repoData);
          setCurrentStep("success");
        } else {
          setSubmitError(
            "No donation.json found. Please add the file and try again.",
          );
        }
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to verify");
    }
  };

  // Complete registration (when config already exists)
  const handleComplete = async () => {
    if (!checkedRepo) return;
    setSubmitError(null);

    try {
      // Call API again to ensure repo is registered
      const repoName =
        checkedRepo.repo_info?.full_name || getValues("repo_full_name");
      const result = await submitMutation.mutateAsync({
        repo_full_name: repoName,
      });
      const repoData = (result.data ?? result) as DonateRepo;

      // Refetch list after successful registration and wait for it
      await invalidateDonateList(repoData?.repo_id ? repoData : checkedRepo);
      setCurrentStep("success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to register");
    }
  };

  const handleModalClose = useCallback(() => {
    if (currentStep === "success") {
      resetForm();
      setCurrentStep("input");
      setCheckedRepo(null);
      setSubmitError(null);
      setConfigValues({
        payTo: "",
        title: "",
        description: "",
        defaultAmount: "",
        network: DEFAULT_NETWORK,
      });
      submitMutation.reset();
      onSuccess?.();
    }
    onClose();
  }, [currentStep, onClose, onSuccess, resetForm, submitMutation]);

  const handleBack = () => {
    setSubmitError(null);
    setCheckedRepo(null);
    setCurrentStep("input");
  };

  // Auth states
  if (!ready) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
        <ModalContent>
          <ModalBody className="py-16">
            <Loader2 size={24} className="animate-spin text-gray-400 mx-auto" />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!authenticated) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
        <ModalContent>
          <ModalBody className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Github size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Sign in to continue
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Connect your account to register repositories.
            </p>
            <Button color="primary" onPress={() => login()}>
              Sign In
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (!githubHandle) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
        <ModalContent>
          <ModalBody className="py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Github size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Connect GitHub
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Link your GitHub account to register repositories.
            </p>
            <Button
              color="primary"
              onPress={handleLinkGithub}
              isLoading={isLinkingGithub}
            >
              Connect GitHub
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  const repoInfo = checkedRepo?.repo_info;
  const donateData = checkedRepo?.repo_donate_data;
  const hasConfig = hasDonationConfig(donateData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      placement="center"
      size="lg"
      isDismissable={currentStep === "input" || currentStep === "success"}
      hideCloseButton={currentStep === "confirm"}
    >
      <ModalContent>
        {/* Step 1: Input */}
        {currentStep === "input" && (
          <>
            <ModalHeader className="pb-0">
              <span className="text-lg font-semibold">Register Repository</span>
            </ModalHeader>
            <ModalBody className="pt-4">
              <form
                onSubmit={handleSubmit(handleCheckRepo)}
                className="space-y-4"
              >
                <Input
                  {...register("repo_full_name")}
                  label="Repository"
                  placeholder="owner/repo"
                  variant="bordered"
                  labelPlacement="outside"
                  startContent={<Github size={16} className="text-gray-400" />}
                  isInvalid={!!errors.repo_full_name}
                  errorMessage={errors.repo_full_name?.message}
                  description="We'll check for .x402/donation.json"
                />

                {submitError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
              </form>
            </ModalBody>
            <ModalFooter className="pt-2">
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => handleSubmit(handleCheckRepo)()}
                isLoading={submitMutation.isPending}
                isDisabled={!isValid || submitMutation.isPending}
              >
                Continue
              </Button>
            </ModalFooter>
          </>
        )}

        {/* Step 2: Confirm */}
        {currentStep === "confirm" && repoInfo && (
          <>
            <ModalHeader className="pb-0">
              <span className="text-lg font-semibold">Confirm Repository</span>
            </ModalHeader>
            <ModalBody className="space-y-4 pt-4">
              {/* Repo Info Card */}
              <div className="flex items-start gap-3">
                <Avatar
                  src={repoInfo.owner.avatar_url}
                  size="lg"
                  radius="lg"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={repoInfo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors"
                    >
                      {repoInfo.full_name}
                    </a>
                    <ExternalLink
                      size={14}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </div>
                  {repoInfo.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {repoInfo.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <Star size={12} />
                    <span>{repoInfo.stargazers_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* Config Status */}
              {hasConfig ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      donation.json detected
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Recipient</span>
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {donateData?.payTo?.slice(0, 6)}...
                        {donateData?.payTo?.slice(-4)}
                      </span>
                    </div>
                    {donateData?.title && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Title</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {donateData.title}
                        </span>
                      </div>
                    )}
                    {donateData?.defaultAmount && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Default</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          ${donateData.defaultAmount} USDC
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertCircle size={16} />
                    <span className="text-sm">No donation.json found</span>
                  </div>

                  {/* Config Generator */}
                  <div className="space-y-3">
                    <Input
                      size="sm"
                      label="Wallet Address"
                      placeholder="0x..."
                      value={configValues.payTo}
                      onChange={(e) =>
                        setConfigValues({
                          ...configValues,
                          payTo: e.target.value,
                        })
                      }
                      variant="bordered"
                      labelPlacement="outside"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        size="sm"
                        label="Title"
                        placeholder="Project name"
                        value={configValues.title}
                        onChange={(e) =>
                          setConfigValues({
                            ...configValues,
                            title: e.target.value,
                          })
                        }
                        variant="bordered"
                        labelPlacement="outside"
                      />
                      <Input
                        size="sm"
                        label="Default Amount"
                        placeholder="5"
                        type="number"
                        value={configValues.defaultAmount}
                        onChange={(e) =>
                          setConfigValues({
                            ...configValues,
                            defaultAmount: e.target.value,
                          })
                        }
                        variant="bordered"
                        labelPlacement="outside"
                      />
                      <Select
                        size="sm"
                        label="Network"
                        selectedKeys={[configValues.network]}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0] as NetworkKey;
                          if (value)
                            setConfigValues({
                              ...configValues,
                              network: value,
                            });
                        }}
                        variant="bordered"
                        labelPlacement="outside"
                      >
                        {SUPPORTED_NETWORKS.map((net) => (
                          <SelectItem key={net.value} textValue={net.label}>
                            {net.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Generated JSON */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        .x402/donation.json
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={handleCopyConfig}
                          isDisabled={!isValidConfig}
                          className="h-7 w-7 min-w-0"
                        >
                          {configCopied ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={handleDownloadConfig}
                          isDisabled={!isValidConfig}
                          className="h-7 w-7 min-w-0"
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                    <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                      {generatedConfig}
                    </pre>
                    <p className="text-xs text-gray-400 mt-2">
                      Add this file to your repo, then click Verify.
                    </p>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="pt-2">
              <Button variant="light" onPress={handleBack}>
                Back
              </Button>
              {hasConfig ? (
                <Button
                  color="primary"
                  onPress={handleComplete}
                  isLoading={submitMutation.isPending}
                >
                  Register
                </Button>
              ) : (
                <Button
                  color="primary"
                  onPress={handleVerify}
                  isLoading={submitMutation.isPending}
                  startContent={
                    !submitMutation.isPending && <RefreshCw size={14} />
                  }
                >
                  Verify
                </Button>
              )}
            </ModalFooter>
          </>
        )}

        {/* Step 3: Success */}
        {currentStep === "success" && (
          <>
            <ModalBody className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Repository Registered
              </h3>
              <p className="text-sm text-gray-500">
                {repoInfo?.full_name} is now accepting donations.
              </p>
            </ModalBody>
            <ModalFooter className="justify-center pt-0">
              <Button color="primary" onPress={handleModalClose}>
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

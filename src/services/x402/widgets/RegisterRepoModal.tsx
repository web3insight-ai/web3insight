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
  Textarea,
} from "@/components/ui";
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
  Plus,
  Trash2,
} from "lucide-react";
import {
  donateRepoSubmitSchema,
  type DonateRepoSubmitInput,
} from "@/lib/form/schemas";
import {
  useCheckDonateRepo,
  useSubmitDonateRepo,
  useInvalidateDonateList,
} from "@/hooks/api/useDonate";
import type { DonationConfig, DonateRepo } from "@/lib/api/types";

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
    defaultAmount: "",
    title: "",
    description: "",
    creatorHandle: "",
    creatorAvatar: "",
    links: [] as { url: string; label: string }[],
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

  const checkMutation = useCheckDonateRepo();
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
    if (configValues.defaultAmount)
      config.defaultAmount = configValues.defaultAmount;
    if (configValues.title) config.title = configValues.title;
    if (configValues.description) config.description = configValues.description;
    // Build creator object
    if (configValues.creatorHandle || configValues.creatorAvatar) {
      const creator: { handle?: string; avatar?: string } = {};
      if (configValues.creatorHandle)
        creator.handle = configValues.creatorHandle;
      if (configValues.creatorAvatar)
        creator.avatar = configValues.creatorAvatar;
      config.creator = creator;
    }
    // Build links array
    const validLinks = configValues.links.filter((l) => l.url && l.label);
    if (validLinks.length > 0) config.links = validLinks;
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

  // Step 1: Check repository (does NOT write to database)
  const handleCheckRepo = async (data: DonateRepoSubmitInput) => {
    setSubmitError(null);

    try {
      const result = await checkMutation.mutateAsync(data);
      const repoData = (result.data ?? result) as DonateRepo;
      const isSuccess = result.success !== false && repoData?.repo_id;

      if (isSuccess && repoData) {
        setCheckedRepo(repoData);

        // Pre-fill config if no donation.json found
        if (!hasDonationConfig(repoData.repo_donate_data)) {
          const repoInfo = repoData.repo_info;
          const repoFullName = repoInfo?.full_name || data.repo_full_name;
          setConfigValues({
            payTo: "",
            defaultAmount: "",
            title: repoFullName.split("/")[1] || "",
            description: repoInfo?.description || "",
            creatorHandle: repoFullName.split("/")[0] || "",
            creatorAvatar: repoInfo?.owner?.avatar_url || "",
            links: [
              {
                url: repoInfo?.html_url || `https://github.com/${repoFullName}`,
                label: "Repository",
              },
            ],
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

  // Step 2: Verify (re-check for donation.json, then write to database if found)
  const handleVerify = async () => {
    if (!checkedRepo) return;
    setSubmitError(null);

    try {
      const repoName =
        checkedRepo.repo_info?.full_name || getValues("repo_full_name");

      // First, check if donation.json exists now
      const checkResult = await checkMutation.mutateAsync({
        repo_full_name: repoName,
      });
      const checkData = (checkResult.data ?? checkResult) as DonateRepo;

      if (checkData?.repo_id) {
        setCheckedRepo(checkData);

        if (hasDonationConfig(checkData.repo_donate_data)) {
          // donation.json found! Now actually register the repo
          const submitResult = await submitMutation.mutateAsync({
            repo_full_name: repoName,
          });
          const repoData = (submitResult.data ?? submitResult) as DonateRepo;

          if (repoData?.repo_id) {
            await invalidateDonateList(repoData);
            setCurrentStep("success");
          }
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

  // Complete registration (when config already exists from check)
  const handleComplete = async () => {
    if (!checkedRepo) return;
    setSubmitError(null);

    // Only proceed if donation config exists
    if (!hasDonationConfig(checkedRepo.repo_donate_data)) {
      setSubmitError("No donation.json found");
      return;
    }

    try {
      const repoName =
        checkedRepo.repo_info?.full_name || getValues("repo_full_name");
      const result = await submitMutation.mutateAsync({
        repo_full_name: repoName,
      });
      const repoData = (result.data ?? result) as DonateRepo;

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
        defaultAmount: "",
        title: "",
        description: "",
        creatorHandle: "",
        creatorAvatar: "",
        links: [],
      });
      checkMutation.reset();
      submitMutation.reset();
      onSuccess?.();
    }
    onClose();
  }, [
    currentStep,
    onClose,
    onSuccess,
    resetForm,
    checkMutation,
    submitMutation,
  ]);

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
      scrollBehavior="inside"
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
                isLoading={checkMutation.isPending}
                isDisabled={!isValid || checkMutation.isPending}
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
                  <div className="space-y-4">
                    {/* Row 1: Wallet + Amount */}
                    <div className="grid grid-cols-2 gap-3">
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
                      />
                      <Input
                        size="sm"
                        label="Default Amount"
                        placeholder="0.1"
                        value={configValues.defaultAmount}
                        onChange={(e) =>
                          setConfigValues({
                            ...configValues,
                            defaultAmount: e.target.value,
                          })
                        }
                        variant="bordered"
                      />
                    </div>

                    {/* Row 2: Title */}
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
                    />

                    {/* Row 3: Description */}
                    <Textarea
                      size="sm"
                      label="Description"
                      placeholder="Brief description of your project"
                      value={configValues.description}
                      onChange={(e) =>
                        setConfigValues({
                          ...configValues,
                          description: e.target.value,
                        })
                      }
                      variant="bordered"
                      minRows={3}
                      maxRows={3}
                    />

                    {/* Row 4: Creator Handle + Avatar */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        size="sm"
                        label="Creator Handle"
                        placeholder="github-username"
                        value={configValues.creatorHandle}
                        onChange={(e) =>
                          setConfigValues({
                            ...configValues,
                            creatorHandle: e.target.value,
                          })
                        }
                        variant="bordered"
                      />
                      <Input
                        size="sm"
                        label="Creator Avatar"
                        placeholder="https://..."
                        value={configValues.creatorAvatar}
                        onChange={(e) =>
                          setConfigValues({
                            ...configValues,
                            creatorAvatar: e.target.value,
                          })
                        }
                        variant="bordered"
                      />
                    </div>

                    {/* Row 5: Links */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Links
                        </span>
                        <Button
                          size="sm"
                          variant="flat"
                          isDisabled={configValues.links.length >= 5}
                          onPress={() =>
                            setConfigValues({
                              ...configValues,
                              links: [
                                ...configValues.links,
                                { url: "", label: "" },
                              ],
                            })
                          }
                          startContent={<Plus size={14} />}
                          className="h-7"
                        >
                          Add Link
                        </Button>
                      </div>
                      {configValues.links.map((link, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            size="sm"
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...configValues.links];
                              newLinks[index].label = e.target.value;
                              setConfigValues({
                                ...configValues,
                                links: newLinks,
                              });
                            }}
                            variant="bordered"
                            className="w-28"
                          />
                          <Input
                            size="sm"
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...configValues.links];
                              newLinks[index].url = e.target.value;
                              setConfigValues({
                                ...configValues,
                                links: newLinks,
                              });
                            }}
                            variant="bordered"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            color="danger"
                            onPress={() => {
                              const newLinks = configValues.links.filter(
                                (_, i) => i !== index,
                              );
                              setConfigValues({
                                ...configValues,
                                links: newLinks,
                              });
                            }}
                            className="h-8 w-8 min-w-0"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
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
                  isLoading={
                    checkMutation.isPending || submitMutation.isPending
                  }
                  startContent={
                    !(checkMutation.isPending || submitMutation.isPending) && (
                      <RefreshCw size={14} />
                    )
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

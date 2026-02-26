"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrivy } from "@privy-io/react-auth";
import { Github, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { FormInput } from "@/lib/form/components";
import {
  donateRepoSubmitSchema,
  type DonateRepoSubmitInput,
} from "@/lib/form/schemas";
import { useSubmitDonateRepo } from "@/hooks/api/useDonate";
import type { SubmitRepoFormProps } from "../typing";

export function SubmitRepoForm({ onSuccess, onError }: SubmitRepoFormProps) {
  const {
    ready,
    authenticated,
    login,
    user: privyUser,
    linkGithub,
  } = usePrivy();

  // Get GitHub handle from Privy linkedAccounts
  const githubAccount = privyUser?.linkedAccounts?.find(
    (acc) => acc.type === "github_oauth",
  );
  const githubHandle = githubAccount?.username || null;

  // State for GitHub linking modal
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [isLinkingGithub, setIsLinkingGithub] = useState(false);

  // Form and mutation
  const methods = useForm<DonateRepoSubmitInput>({
    resolver: zodResolver(donateRepoSubmitSchema),
    defaultValues: { repo_full_name: "" },
    mode: "onChange",
  });

  const submitMutation = useSubmitDonateRepo();

  // Show GitHub modal when authenticated but no GitHub linked
  useEffect(() => {
    if (ready && authenticated && !githubHandle) {
      setShowGitHubModal(true);
    } else {
      setShowGitHubModal(false);
    }
  }, [ready, authenticated, githubHandle]);

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

  const handleSubmit = async (data: DonateRepoSubmitInput) => {
    if (!authenticated) {
      login();
      return;
    }

    if (!githubHandle) {
      setShowGitHubModal(true);
      return;
    }

    try {
      const result = await submitMutation.mutateAsync(data);

      if (result.success && result.data) {
        methods.reset();
        onSuccess?.(result.data);
      } else {
        onError?.(result.message || "Failed to submit repository");
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to submit");
    }
  };

  // Not ready yet
  if (!ready) {
    return (
      <Card className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
        <CardBody className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Not authenticated - show login prompt
  if (!authenticated) {
    return (
      <Card className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
        <CardBody className="p-6">
          <div className="text-center py-4">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Github size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to Submit
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Connect your GitHub account to register your repository for
              donations.
            </p>
            <Button color="primary" onPress={() => login()}>
              Sign In
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Register Your Repository
          </h3>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormInput<DonateRepoSubmitInput>
                name="repo_full_name"
                label="Repository"
                placeholder="owner/repo (e.g., ethereum/go-ethereum)"
                startContent={<Github size={16} className="text-gray-400" />}
              />

              {submitMutation.isSuccess && submitMutation.data?.success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle
                    size={20}
                    className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Repository registered successfully!
                    </p>
                    {submitMutation.data.data?.repo_donate_data?.payTo ? (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        donation.json detected with payTo address.
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        No donation.json found. Use the generator below to
                        create one.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {submitMutation.isError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle
                    size={20}
                    className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Failed to register repository
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {submitMutation.error instanceof Error
                        ? submitMutation.error.message
                        : "Please check the repository name and try again."}
                    </p>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={submitMutation.isPending}
                isDisabled={
                  !methods.formState.isValid || submitMutation.isPending
                }
              >
                {submitMutation.isPending
                  ? "Registering..."
                  : "Register Repository"}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                We&apos;ll automatically check for a{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-primary">
                  .x402/donation.json
                </code>{" "}
                file in your repository.
              </p>
            </form>
          </FormProvider>
        </CardBody>
      </Card>

      {/* GitHub Account Required Modal */}
      <Modal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <AlertCircle
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <span className="text-xl font-semibold">
                GitHub Account Required
              </span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-600 dark:text-gray-400">
              To register your repository for donations, you need to connect
              your GitHub account. This helps verify ownership of the
              repositories you submit.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowGitHubModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleLinkGithub}
              isLoading={isLinkingGithub}
              startContent={!isLinkingGithub && <Github size={18} />}
            >
              Connect GitHub
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

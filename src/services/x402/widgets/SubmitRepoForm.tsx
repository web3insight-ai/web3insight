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
      <Card className="bg-bg-raised border border-rule">
        <CardBody className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-fg-muted" />
          </div>
        </CardBody>
      </Card>
    );
  }

  // Not authenticated - show login prompt
  if (!authenticated) {
    return (
      <Card className="bg-bg-raised border border-rule">
        <CardBody className="p-6">
          <div className="text-center py-4">
            <div className="p-3 rounded-[2px] border border-rule bg-accent-subtle w-fit mx-auto mb-4">
              <Github size={24} className="text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-fg mb-2">
              Sign in to Submit
            </h3>
            <p className="text-sm text-fg-muted mb-4">
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
      <Card className="bg-bg-raised border border-rule">
        <CardBody className="p-6">
          <h3 className="text-lg font-semibold text-fg mb-4">
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
                startContent={<Github size={16} className="text-fg-muted" />}
              />

              {submitMutation.isSuccess && submitMutation.data?.success && (
                <div className="flex items-start gap-3 p-4 bg-accent-subtle rounded-[2px] border border-accent/30">
                  <CheckCircle
                    size={20}
                    className="text-accent flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-accent">
                      Repository registered successfully!
                    </p>
                    {submitMutation.data.data?.repo_donate_data?.payTo ? (
                      <p className="text-xs text-accent mt-1">
                        donation.json detected with payTo address.
                      </p>
                    ) : (
                      <p className="text-xs text-accent mt-1">
                        No donation.json found. Use the generator below to
                        create one.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {submitMutation.isError && (
                <div className="flex items-start gap-3 p-4 bg-danger/10 rounded-[2px] border border-danger/30">
                  <AlertCircle
                    size={20}
                    className="text-danger flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-danger">
                      Failed to register repository
                    </p>
                    <p className="text-xs text-danger mt-1">
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

              <p className="text-xs text-fg-muted text-center">
                We&apos;ll automatically check for a{" "}
                <code className="bg-bg-raised px-1 py-0.5 rounded-[2px] text-accent font-mono">
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
              <div className="p-2 bg-warn/10 rounded-[2px] border border-warn/30">
                <AlertCircle size={24} className="text-warn" />
              </div>
              <span className="text-xl font-semibold">
                GitHub Account Required
              </span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-fg-muted">
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

"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@/components/ui";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom } from "#/atoms";
import { Sparkles } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import { getTitle } from "@/utils/app";

function AuthFormDialogView() {
  const [isOpen, setIsOpen] = useAtom(authModalOpenAtom);
  const router = useRouter();
  const { ready, authenticated } = usePrivy();

  // Auto-close modal when user successfully authenticates
  useEffect(() => {
    if (ready && authenticated && isOpen) {
      setIsOpen(false);
      // Refresh the page to update user state across the app
      router.refresh();
    }
  }, [ready, authenticated, isOpen, setIsOpen, router]);

  const onClose = () => {
    setIsOpen(false);
  };

  // If Privy is handling auth, we don't need to show this modal
  // This modal is now mainly for legacy support or fallback
  if (ready) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="sm"
      classNames={{
        base: "max-w-sm mx-4",
        wrapper: "overflow-visible",
        backdrop: "bg-background-dark/50",
        header: "border-b border-rule",
        body: "p-0",
        closeButton: "hover:bg-bg-sunken transition-colors",
      }}
    >
      <ModalContent className="bg-bg-raised border border-rule">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 px-6 py-5">
              <div className="p-2 rounded-[2px] bg-accent-subtle">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-fg">
                  Welcome to {getTitle()}
                </h2>
                <p className="text-sm text-fg-muted mt-1">
                  Sign in to access your insights
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="px-6 py-6 relative">
                {/* Loading State */}
                {!ready && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-fg">
                        Loading authentication...
                      </p>
                    </div>
                  </div>
                )}

                {/* Ready State - Privy handles the login UI */}
                {ready && (
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-fg">
                        Connect Your Account
                      </h3>
                      <p className="text-fg-muted text-sm">
                        Access Web3 analytics and insights with multiple login
                        options
                      </p>
                    </div>

                    {/* Info text */}
                    <p className="text-xs text-fg-muted pt-2">
                      Privy login modal will appear shortly. You can sign in
                      with email, wallet, GitHub, or Google.
                    </p>

                    {/* Minimal Footer */}
                    <p className="text-xs text-fg-muted pt-2">
                      By signing in, you agree to our terms and privacy policy
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default AuthFormDialogView;

import { Button, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom } from "#/atoms";
import { useRevalidator, useOutletContext } from "@remix-run/react";
import { Sparkles, Github } from "lucide-react";

import { getTitle } from "@/utils/app";

import type { ApiUser } from "../../typing";
import { fetchCurrentUser, getGitHubAuthUrl } from "../../repository";

type AuthContext<U = ApiUser | null> = {
  user: U;
  setUser: (user: U) => void;
};

function AuthFormDialogView() {
  const [isOpen, setIsOpen] = useAtom(authModalOpenAtom);
  const { setUser } = useOutletContext<AuthContext>();
  const revalidator = useRevalidator();

  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if we're returning from GitHub OAuth (has code in URL)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hasCode = urlParams.has('code');
      if (hasCode && isOpen) {
        setIsAuthenticating(true);
      }
    }
  }, [isOpen]);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      if (res.success) {
        if (res.data) {
          // Update user context
          if (setUser) {
            setUser(res.data);
          }
          // Force re-validation of all loaders
          revalidator.revalidate();
        }
      }
    } catch (error) {
      // Silent fail - errors will be handled by the UI gracefully
    }
  }, [setUser, revalidator]);

  // Handle successful login
  useEffect(() => {
    if (isLoginSuccess) {
      // Fetch updated user data
      fetchUserData();
      // Reset state
      setIsLoginSuccess(false);
      setIsAuthenticating(false);
      // Close modal
      setIsOpen(false);
    }
  }, [isLoginSuccess, fetchUserData, setIsOpen]);

  const onClose = () => {
    if (!isAuthenticating) {
      setIsOpen(false);
    }
  };

  const handleGitHubAuth = () => {
    setIsAuthenticating(true);
    // Small delay to show loading state before redirect
    setTimeout(() => {
      // Redirect to GitHub OAuth URL
      window.location.href = getGitHubAuthUrl();
    }, 500);
  };

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
        header: "border-b border-border dark:border-border-dark",
        body: "p-0",
        closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
      }}
    >
      <ModalContent className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        {() => (
          <>
            <ModalHeader className="flex items-center gap-3 px-6 py-5">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Welcome to {getTitle()}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign in to access your insights
                </p>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="px-6 py-6 relative">
                {/* Loading Overlay */}
                {isAuthenticating && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-lg">
                    <div className="text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Redirecting to GitHub...
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="text-center space-y-4">
                  {/* Simple Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Connect with GitHub
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Access Web3 analytics and insights
                    </p>
                  </div>

                  {/* GitHub Sign In Button */}
                  <Button
                    size="lg"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70"
                    onClick={handleGitHubAuth}
                    disabled={isAuthenticating}
                    startContent={
                      isAuthenticating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Github size={20} />
                      )
                    }
                  >
                    {isAuthenticating ? "Connecting..." : "Continue with GitHub"}
                  </Button>

                  {/* Minimal Footer */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                    By signing in, you agree to our terms and privacy policy
                  </p>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default AuthFormDialogView;

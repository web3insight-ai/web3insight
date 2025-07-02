import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, Tabs, Tab } from "@nextui-org/react";
import { FormEvent, useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";
import { Form, useActionData, useNavigation, useSubmit, useRevalidator, useOutletContext } from "@remix-run/react";
import type { ResponseResult } from "@/types";

import { getTitle } from "@/utils/app";

import type { StrapiUser } from "../../typing";
import { signIn, fetchCurrentUser, getGitHubAuthUrl } from "../../repository";

type AuthContext<U = StrapiUser | null> = {
  user: U;
  setUser: (user: U) => void;
};

function AuthFormDialogView() {
  const [isOpen, setIsOpen] = useAtom(authModalOpenAtom);
  const [modalType, setModalType] = useAtom(authModalTypeAtom);
  const { setUser } = useOutletContext<AuthContext>();
  const revalidator = useRevalidator();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<ResponseResult>();
  const submit = useSubmit();

  // Handle successful login
  useEffect(() => {
    if (isLoginSuccess) {
      // Fetch updated user data
      fetchUserData();
      // Reset state
      setIsLoginSuccess(false);
      // Close modal
      setIsOpen(false);
    }
  }, [isLoginSuccess, fetchUserData, setIsOpen]);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      if (res.success) {
        if (res.extra?.authenticated && res.data) {
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

  const onClose = () => {
    setIsOpen(false);
    // Reset fields
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
  };

  const handleTabChange = (key: React.Key) => {
    setModalType(key === "signup" ? "signup" : "signin");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Different actions based on modal type
    if (modalType === "signin") {
      try {
        const res = await signIn({ identifier: email, password });

        if (res.success) {
          if (res.data?.user) {
            // Update user context with the returned user data
            setUser(res.data.user);
          }
          setIsLoginSuccess(true);
        } else {
          alert(res.message || "Login failed");
        }
      } catch (error) {
        // Silent fail, errors will be handled by the UI
        alert("An error occurred during login");
      }
    } else if (modalType === "signup") {
      if (password !== confirmPassword) {
        // Handle password mismatch client-side
        alert("Passwords don't match");
        return;
      }
      submit(
        { email, password, username, action: "signup" },
        { method: "post", action: "/auth" },
      );
    } else if (modalType === "resetPassword") {
      submit(
        { email, action: "forgotPassword" },
        { method: "post", action: "/auth" },
      );
    }
  };

  const handleGitHubAuth = () => {
    // Redirect to GitHub OAuth URL
    window.location.href = getGitHubAuthUrl();
  };

  // Success state after password reset email sent
  const showResetSent = modalType === "resetPassword" && actionData?.extra?.resetSuccess;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      classNames={{
        base: "bg-white dark:bg-gray-800",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 dark:text-gray-300">
              {modalType === "signin" || modalType === "signup"
                ? `Welcome to ${getTitle()}`
                : showResetSent
                  ? "Check Your Email"
                  : "Reset Password"}
            </ModalHeader>

            <ModalBody>
              {modalType === "signin" || modalType === "signup" ? (
                <>
                  <Tabs
                    selectedKey={modalType}
                    onSelectionChange={handleTabChange}
                    variant="underlined"
                    color="primary"
                    classNames={{
                      tabList: "gap-6 w-full relative rounded-none p-0 border-divider",
                      cursor: "w-full bg-primary",
                      tab: "max-w-fit px-0 h-12",
                    }}
                  >
                    <Tab key="signin" title="Sign In" />
                    <Tab key="signup" title="Sign Up" />
                  </Tabs>

                  <div className="py-4">
                    <Form method="post" action="/auth" onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        {/* Email field */}
                        <Input
                          type="email"
                          label="Email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          variant="bordered"
                          isRequired
                          autoComplete="email"
                        />

                        {/* Username field (only for signup) */}
                        {modalType === "signup" && (
                          <Input
                            type="text"
                            label="Username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="bordered"
                            isRequired
                            autoComplete="username"
                          />
                        )}

                        {/* Password field */}
                        <Input
                          type="password"
                          label="Password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          variant="bordered"
                          isRequired
                          autoComplete={modalType === "signin" ? "current-password" : "new-password"}
                        />

                        {/* Confirm Password field (only for signup) */}
                        {modalType === "signup" && (
                          <Input
                            type="password"
                            label="Confirm Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            variant="bordered"
                            isRequired
                            autoComplete="new-password"
                          />
                        )}

                        {/* Error message */}
                        {actionData?.success === false && (
                          <div className="text-danger text-sm">{actionData?.message}</div>
                        )}

                        {/* Forgot password link (only for signin) */}
                        {modalType === "signin" && (
                          <div className="text-right">
                            <Button
                              variant="light"
                              size="sm"
                              className="p-0 text-primary"
                              onClick={() => setModalType("resetPassword")}
                            >
                              Forgot password?
                            </Button>
                          </div>
                        )}

                        <Button
                          type="submit"
                          color="primary"
                          className="w-full"
                          isLoading={isSubmitting}
                        >
                          {modalType === "signin" ? "Sign In" : "Sign Up"}
                        </Button>

                        {/* GitHub OAuth Button */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="bordered"
                          className="w-full"
                          onClick={handleGitHubAuth}
                          startContent={
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="text-gray-700 dark:text-gray-300"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          }
                        >
                          GitHub
                        </Button>
                      </div>
                    </Form>
                  </div>
                </>
              ) : (
                // Reset password form
                showResetSent ? (
                  <div className="py-6 text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We&apos;ve sent an email to <strong>{actionData?.extra?.email}</strong> with instructions to reset your password.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      If you don&apos;t receive the email within a few minutes, please check your spam folder.
                    </p>
                  </div>
                ) : (
                  <Form method="post" action="/auth" onSubmit={handleSubmit}>
                    <div className="space-y-4 py-2">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </p>
                      <Input
                        type="email"
                        label="Email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="bordered"
                        isRequired
                      />

                      {actionData?.success === false && (
                        <div className="text-danger text-sm">{actionData?.message}</div>
                      )}

                      <div className="flex justify-between items-center">
                        <Button
                          variant="light"
                          onClick={() => setModalType("signin")}
                        >
                          Back to login
                        </Button>
                        <Button
                          type="submit"
                          color="primary"
                          isLoading={isSubmitting}
                        >
                          Send reset link
                        </Button>
                      </div>
                    </div>
                  </Form>
                )
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default AuthFormDialogView;

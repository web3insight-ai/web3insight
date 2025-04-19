import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
  Image,
} from "@nextui-org/react";
import { Form } from "@remix-run/react";
import { Eye, EyeOff, LogIn, UserPlus, AtSign, KeyRound } from "lucide-react";
import { useAtom } from "jotai";
import Logo from "~/images/logo.png";
import { authModalOpenAtom, authModalTypeAtom, authRedirectToAtom } from "~/atoms";

export default function AuthModal() {
  const [isOpen, setIsOpen] = useAtom(authModalOpenAtom);
  const [modalType, setModalType] = useAtom(authModalTypeAtom);
  const [redirectTo] = useAtom(authRedirectToAtom);
  // Track if this is a password change request from the user menu (which means user is logged in)
  const [isChangePassword, setIsChangePassword] = useState(false);

  // Close the modal
  const onClose = () => {
    setIsOpen(false);
    // Reset the change password flag when closing
    setIsChangePassword(false);
  };

  // Switch to login form
  const showLogin = () => {
    setModalType("signin");
    setIsChangePassword(false);
  };

  // Switch to register form
  const showRegister = () => {
    setModalType("signup");
    setIsChangePassword(false);
  };

  // Switch to forgot password form
  const showForgotPassword = () => {
    setModalType("forgotPassword");
    setIsChangePassword(false);
  };

  // Get modal title based on the current mode
  const getModalTitle = () => {
    if (modalType === "resetPassword" && isChangePassword) {
      return "Change Password";
    }

    switch (modalType) {
      case "signin":
        return "Welcome Back";
      case "signup":
        return "Create Account";
      case "forgotPassword":
        return "Forgot Password";
      case "resetPassword":
        return "Reset Password";
      default:
        return "Authentication";
    }
  };

  // Get modal subtitle based on the current mode
  const getModalSubtitle = () => {
    if (modalType === "resetPassword" && isChangePassword) {
      return "Update your password";
    }

    switch (modalType) {
      case "signin":
        return "Sign in to your Web3Insights account";
      case "signup":
        return "Join Web3Insights to explore blockchain data";
      case "forgotPassword":
        return "Enter your email to receive a password reset link";
      case "resetPassword":
        return "Enter your new password";
      default:
        return "";
    }
  };

  // When the component is mounted and the modalType is set to resetPassword from user menu
  useEffect(() => {
    // Check if modal was opened for password change from the user menu
    if (isOpen && modalType === "resetPassword" && window.location.pathname.startsWith("/profile")) {
      setIsChangePassword(true);
    }
  }, [isOpen, modalType]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-0 pt-6 px-6">
          <div className="flex justify-center w-full">
            <Image
              src={Logo}
              width={40}
              alt="Web3Insights Logo"
              className="mx-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-center">{getModalTitle()}</h2>
          <p className="text-sm text-gray-500 text-center">
            {getModalSubtitle()}
          </p>
        </ModalHeader>
        <ModalBody className="overflow-hidden py-6 px-6">
          {modalType === "signin" && (
            <LoginForm redirectTo={redirectTo} onForgotPassword={showForgotPassword} onRegister={showRegister} />
          )}
          {modalType === "signup" && (
            <RegisterForm redirectTo={redirectTo} onLogin={showLogin} />
          )}
          {modalType === "forgotPassword" && (
            <ForgotPasswordForm onLogin={showLogin} />
          )}
          {modalType === "resetPassword" && (
            <ResetPasswordForm isLoggedIn={isChangePassword} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// Login Form Component
function LoginForm({
  redirectTo,
  onForgotPassword,
  onRegister
}: {
  redirectTo: string | null;
  onForgotPassword: () => void;
  onRegister: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setIsOpen] = useAtom(authModalOpenAtom);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: formData.get("identifier"),
          password: formData.get("password"),
          redirectTo: redirectTo || "/"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      // For login, we don't need to parse the response as JSON since the server sends
      // a redirect response with a Set-Cookie header if successful

      // If response is a redirect (302, 303) or OK (200), consider it successful
      if (response.ok || response.status === 302 || response.status === 303) {
        // Close the modal before redirecting
        setIsOpen(false);

        // Give time for the modal to close
        setTimeout(() => {
          // If successful, reload the page to apply the session
          window.location.href = redirectTo || "/";
        }, 100);

        return;
      }

      // Only try to parse JSON for error responses
      const data = await response.json();
      setError(data.error || "Failed to sign in");
      setIsLoading(false);
    } catch (err) {
      console.error("Login form error:", err);
      setError("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo || "/"} />

      <Input
        type="text"
        name="identifier"
        label="Email or Username"
        placeholder="Enter your email or username"
        autoComplete="email"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
      />

      <Input
        label="Password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleVisibility}
            disabled={isLoading}
          >
            {isVisible ? (
              <EyeOff className="text-default-400" size={16} />
            ) : (
              <Eye className="text-default-400" size={16} />
            )}
          </button>
        }
        type={isVisible ? "text" : "password"}
      />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        className="w-full font-medium"
        endContent={<LogIn size={16} />}
        isLoading={isLoading}
      >
        Sign in
      </Button>

      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary text-sm"
          disabled={isLoading}
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="text-primary text-sm"
          disabled={isLoading}
        >
          Create an account
        </button>
      </div>
    </Form>
  );
}

// Register Form Component
function RegisterForm({
  redirectTo,
  onLogin
}: {
  redirectTo: string | null;
  onLogin: () => void;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setIsOpen] = useAtom(authModalOpenAtom);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    // Check if passwords match
    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: formData.get("username"),
          email: formData.get("email"),
          password: formData.get("password"),
          redirectTo: redirectTo || "/"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      // Close the modal before redirecting
      setIsOpen(false);

      // If successful, reload the page to apply the session
      window.location.href = redirectTo || "/";
    } catch (err) {
      setError("An error occurred during registration");
      setIsLoading(false);
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo || "/"} />

      <Input
        type="text"
        name="username"
        label="Username"
        placeholder="Choose a username"
        autoComplete="username"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
      />

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Enter your email"
        autoComplete="email"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
      />

      <Input
        label="Password"
        name="password"
        placeholder="Create a password"
        autoComplete="new-password"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={togglePasswordVisibility}
            disabled={isLoading}
          >
            {isPasswordVisible ? (
              <EyeOff className="text-default-400" size={16} />
            ) : (
              <Eye className="text-default-400" size={16} />
            )}
          </button>
        }
        type={isPasswordVisible ? "text" : "password"}
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm your password"
        autoComplete="new-password"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            disabled={isLoading}
          >
            {isConfirmPasswordVisible ? (
              <EyeOff className="text-default-400" size={16} />
            ) : (
              <Eye className="text-default-400" size={16} />
            )}
          </button>
        }
        type={isConfirmPasswordVisible ? "text" : "password"}
      />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        className="w-full font-medium"
        endContent={<UserPlus size={16} />}
        isLoading={isLoading}
      >
        Create Account
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{" "}
        <button
          type="button"
          onClick={onLogin}
          className="text-primary"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </Form>
  );
}

// Forgot Password Form Component
function ForgotPasswordForm({
  onLogin
}: {
  onLogin: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setIsOpen] = useAtom(authModalOpenAtom);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email")
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send reset link");
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccess(data.message || "Reset link sent! Check your email.");
      setIsLoading(false);

      // Automatically switch to login after 3 seconds
      setTimeout(() => {
        setIsOpen(false);
        onLogin();
      }, 3000);
    } catch (err) {
      setError("An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-5">
      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Enter your email address"
        autoComplete="email"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading || !!success}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
      />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-500 text-sm">
          {success}
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        className="w-full font-medium"
        endContent={<AtSign size={16} />}
        isLoading={isLoading}
        isDisabled={!!success}
      >
        Send Reset Link
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Remember your password?</span>{" "}
        <button
          type="button"
          onClick={onLogin}
          className="text-primary"
          disabled={isLoading}
        >
          Sign in
        </button>
      </div>
    </Form>
  );
}

// Reset Password Form Component
function ResetPasswordForm({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [, setIsOpen] = useAtom(authModalOpenAtom);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  const toggleCurrentPasswordVisibility = () => setIsCurrentPasswordVisible(!isCurrentPasswordVisible);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    let endpoint = "/api/auth/reset-password";
    let body: Record<string, string | FormDataEntryValue | null> = {};

    if (isLoggedIn) {
      // Change password while logged in
      endpoint = "/api/auth/change-password";
      body = {
        currentPassword: formData.get("currentPassword"),
        password: formData.get("password"),
        passwordConfirmation: formData.get("passwordConfirmation")
      };
    } else {
      // Reset password with code (not logged in)
      body = {
        code: formData.get("code"),
        password: formData.get("password"),
        passwordConfirmation: formData.get("passwordConfirmation")
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Format validation errors
          const errorMessages = Object.values(data.errors).join(", ");
          setError(errorMessages);
        } else {
          setError(data.error || "Password reset failed");
        }
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccess(data.message || "Password has been updated successfully");
      setIsLoading(false);

      // Close modal after 3 seconds on success
      setTimeout(() => {
        setIsOpen(false);
        if (isLoggedIn) {
          // Reload page to reflect changes if needed
          window.location.reload();
        }
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An error occurred during password reset");
      setIsLoading(false);
    }
  };

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-5">
      {!isLoggedIn && (
        <Input
          type="text"
          name="code"
          label="Reset Code"
          placeholder="Enter the reset code from your email"
          variant="bordered"
          size="md"
          isRequired
          isDisabled={isLoading || !!success}
          classNames={{
            inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
          }}
        />
      )}

      {isLoggedIn && (
        <Input
          label="Current Password"
          name="currentPassword"
          placeholder="Enter your current password"
          autoComplete="current-password"
          variant="bordered"
          size="md"
          isRequired
          isDisabled={isLoading || !!success}
          classNames={{
            inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
          }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleCurrentPasswordVisibility}
              disabled={isLoading || !!success}
            >
              {isCurrentPasswordVisible ? (
                <EyeOff className="text-default-400" size={16} />
              ) : (
                <Eye className="text-default-400" size={16} />
              )}
            </button>
          }
          type={isCurrentPasswordVisible ? "text" : "password"}
        />
      )}

      <Input
        label="New Password"
        name="password"
        placeholder="Enter your new password"
        autoComplete="new-password"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading || !!success}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={togglePasswordVisibility}
            disabled={isLoading || !!success}
          >
            {isPasswordVisible ? (
              <EyeOff className="text-default-400" size={16} />
            ) : (
              <Eye className="text-default-400" size={16} />
            )}
          </button>
        }
        type={isPasswordVisible ? "text" : "password"}
      />

      <Input
        label="Confirm New Password"
        name="passwordConfirmation"
        placeholder="Confirm your new password"
        autoComplete="new-password"
        variant="bordered"
        size="md"
        isRequired
        isDisabled={isLoading || !!success}
        classNames={{
          inputWrapper: "bg-default-100 dark:bg-default-50 shadow-sm"
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            disabled={isLoading || !!success}
          >
            {isConfirmPasswordVisible ? (
              <EyeOff className="text-default-400" size={16} />
            ) : (
              <Eye className="text-default-400" size={16} />
            )}
          </button>
        }
        type={isConfirmPasswordVisible ? "text" : "password"}
      />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-500 text-sm">
          {success}
        </div>
      )}

      <Button
        type="submit"
        color="primary"
        className="w-full font-medium"
        endContent={<KeyRound size={16} />}
        isLoading={isLoading}
        isDisabled={!!success}
      >
        {isLoggedIn ? "Update Password" : "Reset Password"}
      </Button>
    </Form>
  );
}
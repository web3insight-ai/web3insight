import type { ResponseResult } from "@/types";
import { generateFailedResponse } from "@/clients/http";

import type { StrapiAuthResponse } from "../typing";
import httpClient from "./client";

async function sendConfirmationEmail(email: string): Promise<ResponseResult> {
  try {
    // Send confirmation email using Strapi's built-in endpoint
    return httpClient.post("/auth/send-email-confirmation", { email });
  } catch (error) {
    return generateFailedResponse("Error occurred while sending confirmation mail");
  }
}

// Register a new user
async function registerUser(
  data: {
    username: string;
    email: string;
    password: string;
  },
  requiresEmailVerification: boolean = false,
): Promise<ResponseResult<StrapiAuthResponse | undefined>> {
  try {
    const res = await httpClient.post("/auth/local/register", data);

    if (!res.success) {
      return res;
    }

    const resData = res.data as StrapiAuthResponse;

    // Check if we need to send confirmation email
    if (requiresEmailVerification && resData.user && !resData.user.confirmed) {
      await sendConfirmationEmail(data.email);
    }

    const { extra, ...others } = res;

    return {
      ...others,
      message: "Registration successful. Please check your email to verify your account.",
      extra: {
        ...extra,
        requiresEmailVerification,
      },
    };
  } catch (error) {
    return generateFailedResponse("An error occurred during registration");
  }
}

// Login with Strapi
async function loginUser(
  data: {
    identifier: string; // This can be email or username
    password: string;
  },
): Promise<ResponseResult<StrapiAuthResponse | undefined>> {
  try {
    const res = await httpClient.post("/auth/local", data);

    if (!res.success) {
      return res;
    }

    const resData = res.data as StrapiAuthResponse;

    // Check if email is confirmed
    if (resData.user && !resData.user.confirmed) {
      return {
        ...res,
        message: "Please verify your email address to access all features.",
      };
    }

    return res;
  } catch (error) {
    return generateFailedResponse("An error occurred during login");
  }
}

// Send password reset email
async function sendPasswordResetEmail(email: string): Promise<ResponseResult> {
  try {
    const res = await httpClient.post("/auth/forgot-password", { email });

    return {
      ...res,
      message: res.success ? "Password reset email sent successfully" : (res.message || "Failed to send password reset email"),
    };
  } catch (error) {
    return generateFailedResponse("An error occurred while sending the password reset email");
  }
}

// Reset password with token
async function resetPassword(
  data: {
    code: string;
    password: string;
    passwordConfirmation: string;
  },
): Promise<ResponseResult> {
  try {
    const res = await httpClient.post("/auth/reset-password", data);

    return {
      ...res,
      message: res.success ? "Password has been reset successfully. You can now login." : (res.message || "Failed to reset password"),
    };
  } catch (error) {
    return generateFailedResponse("An error occurred while resetting your password");
  }
}

// Email confirmation
async function confirmEmail(confirmation: string): Promise<ResponseResult> {
  try {
    const res = await httpClient.get("/auth/email-confirmation", { params: { confirmation } });

    return {
      ...res,
      message: res.success ? "Email confirmed successfully. You can now login." : (res.message || "Failed to confirm email"),
    };
  } catch (error) {
    return generateFailedResponse("An error occurred while confirming your email");
  }
}

// Change password
async function changePassword(
  { token, ...others }: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
    token: string;
  },
): Promise<ResponseResult> {
  try {
    const res = await httpClient.post("/auth/change-password", others, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    return {
      ...res,
      message: res.success ? "Password changed successfully" : (res.message || "Failed to change password"),
    };
  } catch (error) {
    return generateFailedResponse("An error occurred while changing your password");
  }
}

export { registerUser, loginUser, sendPasswordResetEmail, resetPassword, confirmEmail, changePassword };

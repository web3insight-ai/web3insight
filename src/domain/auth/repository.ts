import type { ResponseResult } from "@/types";
import { generateFailedResponse } from "@/utils/http";

import {
  registerUser, loginUser,
  changePassword as changePasswordViaStrapi,
  sendPasswordResetEmail as sendPasswordResetEmailViaStrapi,
  resetPassword as resetPasswordViaStrapi,
} from "../strapi/repository";

async function signUp(
  { username, email, password, passwordConfirm }: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
  },
): Promise<ResponseResult> {
  try {
    // Validate required fields
    if (!username || !email || !password) {
      return generateFailedResponse("Username, email, and password are required", 400);
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return generateFailedResponse("Passwords do not match", 400);
    }

    // Basic validation
    if (username.length < 3) {
      return generateFailedResponse("Username must be at least 3 characters", 400);
    }

    if (password.length < 6) {
      return generateFailedResponse("Password must be at least 6 characters", 400);
    }

    // Call Strapi registration service
    return registerUser({ username, email, password });
  } catch (error) {
    console.error("Registration error:", error);
    return generateFailedResponse("An error occurred during registration");
  }
}

async function signIn(
  { identifier, password }: {
    identifier: string;
    password: string;
  },
): Promise<ResponseResult> {
  try {
    if (!identifier || !password) {
      return generateFailedResponse("Email/username and password are required", 400);
    }

    const loginRes = await loginUser({ identifier, password });

    if (!loginRes.success || (loginRes.data!.jwt && loginRes.data!.user)) {
      return loginRes;
    }

    // If we got here, something unexpected happened
    return generateFailedResponse("Login failed");
  } catch (error) {
    console.error("Login error:", error);
    return generateFailedResponse("An error occurred during login");
  }
}

async function changePassword(
  { token, currentPassword, password, passwordConfirmation }: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
    token: string;
  },
): Promise<ResponseResult> {
  try {
    if (!token) {
      return generateFailedResponse("Authentication required", 401);
    }

    // Validate inputs
    if (!currentPassword) {
      return generateFailedResponse("Current password is required", 400);
    }

    if (!password) {
      return generateFailedResponse("New password is required", 400);
    }

    if (!passwordConfirmation) {
      return generateFailedResponse("Password confirmation is required", 400);
    }

    if (password !== passwordConfirmation) {
      return generateFailedResponse("New passwords do not match", 400);
    }

    // Call Strapi change password service
    return changePasswordViaStrapi({ currentPassword, password, passwordConfirmation, token });
  } catch (error) {
    console.error("Password change error:", error);
    return generateFailedResponse("An error occurred during password change");
  }
}

async function sendPasswordResetEmail(email: string): Promise<ResponseResult> {
  try {
    // Call Strapi password reset service
    return email ? sendPasswordResetEmailViaStrapi(email) : generateFailedResponse("Email is required", 400);
  } catch (error) {
    console.error("Password reset request error:", error);
    return generateFailedResponse("An error occurred while processing your request");
  }
}

async function resetPassword(
  { code, password, passwordConfirmation }: {
    code: string;
    password: string;
    passwordConfirmation: string;
  }
): Promise<ResponseResult> {
  try {
    if (!code || !password || !passwordConfirmation) {
      return generateFailedResponse("Reset code and new password are required", 400);
    }

    if (password !== passwordConfirmation) {
      return generateFailedResponse("Passwords do not match", 400);
    }

    if (password.length < 6) {
      return generateFailedResponse("Password must be at least 6 characters", 400);
    }

    // Call Strapi password reset service
    return resetPasswordViaStrapi({ code, password, passwordConfirmation });
  } catch (error) {
    console.error("Password reset error:", error);
    return generateFailedResponse("An error occurred while resetting your password");
  }
}

export { signUp, signIn, changePassword, sendPasswordResetEmail, resetPassword };

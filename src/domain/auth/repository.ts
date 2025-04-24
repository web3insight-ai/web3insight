import type { ResponseResult } from "@/types";
import { isServerSide, generateFailedResponse } from "@/utils/http";
import httpClient from "@/utils/http/default";

import type { StrapiUser } from "../strapi/typing";
import {
  registerUser, loginUser, getCurrentUser,
  changePassword as changePasswordViaStrapi,
  sendPasswordResetEmail as sendPasswordResetEmailViaStrapi,
  resetPassword as resetPasswordViaStrapi,
} from "../strapi/repository";
import { getSession, clearSession } from "./helper";

// Simple in-memory cache for user data
// This will reduce repeated API calls within the same server instance
type UserCache = {
  [key: string]: {
    user: StrapiUser;
    timestamp: number;
  };
};

const userCache: UserCache = {};
const CACHE_TTL = 60 * 1000; // 60 seconds cache TTL

const passwordMinLength = 6;

async function signUp(
  { username, email, password, passwordConfirm }: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
  },
  requiresEmailVerification: boolean = false,
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

    if (password.length < passwordMinLength) {
      return generateFailedResponse(`Password must be at least ${passwordMinLength} characters`, 400);
    }

    // Call Strapi registration service
    return registerUser({ username, email, password }, requiresEmailVerification);
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
  if (!isServerSide()) {
    return httpClient.post("/api/auth/login", { identifier, password, clientSide: true });
  }

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

// Log the user out
async function signOut(request?: Request): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.post("/api/auth/logout", { clientSide: true });
  }

  const session = await getSession(request!);
  const userJwt = session.get("userJwt");

  // Clear from cache if exists
  if (userJwt && userCache[userJwt]) {
    delete userCache[userJwt];
  }

  // Clear the session
  const cookieHeader = await clearSession(session);

  return {
    success: true,
    code: "200",
    data: cookieHeader,
    message: "",
  };
}

// Get the authenticated user from the session
async function fetchCurrentUser(request?: Request): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.get("/api/auth/me");
  }

  const session = await getSession(request!);
  const userJwt = session.get("userJwt");

  const defaultResult = { success: true, code: "200", message: "", data: null };

  // If there's no JWT, user is not authenticated
  if (!userJwt) {
    return defaultResult;
  }

  // Check cache first
  const now = Date.now();
  const cachedData = userCache[userJwt];
  if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
    return { ...defaultResult, data: cachedData.user };
  }

  try {
    // Fetch current user data from Strapi using the JWT
    const res = await getCurrentUser(userJwt);
    const userData = res.data;

    // Check if userData is valid and not an error response
    if (res.success && userData && userData.id) {
      // Cache the result
      userCache[userJwt] = {
        user: userData,
        timestamp: now
      };
      return { ...defaultResult, data: userData };
    }

    // If we couldn't get valid user data, return null
    return defaultResult;
  } catch (error) {
    return defaultResult;
  }
}

async function getUser(request: Request): Promise<StrapiUser | null> {
  return (await fetchCurrentUser(request)).data;
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

    if (password.length < passwordMinLength) {
      return generateFailedResponse(`Password must be at least ${passwordMinLength} characters`, 400);
    }

    // Call Strapi password reset service
    return resetPasswordViaStrapi({ code, password, passwordConfirmation });
  } catch (error) {
    console.error("Password reset error:", error);
    return generateFailedResponse("An error occurred while resetting your password");
  }
}

export {
  signUp, signIn, signOut,
  fetchCurrentUser, getUser,
  changePassword, sendPasswordResetEmail, resetPassword,
};

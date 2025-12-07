import type { ResponseResult } from "@/types";
import { isServerSide, generateFailedResponse } from "@/clients/http";
import httpClient from "@/clients/http/default";

import { getSession, clearSession } from "./helper/server";

import type {
  ApiUser,
  ApiAuthResponse,
  GitHubOAuthRequest,
  MagicResponse,
  WalletBindRequest,
  WalletBindResponse,
} from "./typing";
import { env } from "@/env";

const userCache: Record<string, { user: ApiUser; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 60 seconds cache TTL

const DATA_API_URL = env.DATA_API_URL;

function transformApiUserToCompatibleFormat(apiResponse: {
  profile: {
    user_id: string;
    user_nick_name: string;
    user_avatar: string;
    created_at: string;
    updated_at: string;
  };
  binds: Array<{ bind_type: string; bind_key: string }>;
  role: {
    allowed_roles: string[];
    default_role: string;
    user_id: string;
  };
}): ApiUser {
  const { profile, binds, role } = apiResponse;

  // Find GitHub bind for username
  const githubBind = binds.find(
    (bind: { bind_type: string; bind_key: string }) =>
      bind.bind_type === "github",
  );
  const emailBind = binds.find(
    (bind: { bind_type: string; bind_key: string }) =>
      bind.bind_type === "email",
  );

  return {
    profile,
    binds,
    role,
    id: profile.user_id,
    username: githubBind?.bind_key || profile.user_nick_name,
    email: emailBind?.bind_key || "",
    provider: "github",
    confirmed: true,
    blocked: false,
    avatar_url: profile.user_avatar,
  };
}

// GitHub OAuth login flow
async function signInWithGitHub(
  code: string,
): Promise<ResponseResult<ApiAuthResponse>> {
  if (!isServerSide()) {
    return httpClient.post("/api/auth/login", { code, clientSide: true });
  }

  try {
    if (!code) {
      return generateFailedResponse(
        "GitHub authorization code is required",
        "400",
      );
    }

    const oauthRequest: GitHubOAuthRequest = {
      type: "github",
      code,
    };

    // Exchange code for token
    const response = await fetch(`${DATA_API_URL}/v1/auth/login/oauth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify(oauthRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("GitHub OAuth token exchange failed:", error);
      return generateFailedResponse(
        "Failed to authenticate with GitHub",
        response.status.toString(),
      );
    }

    const authData = await response.json();

    if (!authData.token) {
      return generateFailedResponse(
        "Invalid authentication response from server",
      );
    }

    // Fetch user profile using the token
    const userResponse = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authData.token}`,
        accept: "*/*",
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to fetch user profile:", await userResponse.text());
      return generateFailedResponse(
        "Failed to fetch user profile",
        userResponse.status,
      );
    }

    const userData = await userResponse.json();
    const user = transformApiUserToCompatibleFormat(userData);

    // Cache the result
    userCache[authData.token] = {
      user,
      timestamp: Date.now(),
    };

    return {
      success: true,
      code: "200",
      message: "GitHub authentication successful",
      data: {
        token: authData.token,
        user,
      },
    };
  } catch (error) {
    console.error("GitHub authentication error:", error);
    return generateFailedResponse(
      "An error occurred during GitHub authentication",
    );
  }
}

// Log the user out
async function signOut(request?: Request): Promise<ResponseResult> {
  if (!isServerSide()) {
    return httpClient.post("/api/auth/logout", { clientSide: true });
  }

  const session = await getSession(request!);
  const userToken = session.get("userToken");

  // Clear from cache if exists
  if (userToken && userCache[userToken]) {
    delete userCache[userToken];
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
async function fetchCurrentUser(
  request?: Request,
): Promise<ResponseResult<ApiUser | null>> {
  if (!isServerSide()) {
    return httpClient.get("/api/auth/me");
  }

  const session = await getSession(request!);
  const userToken = session.get("userToken");

  const defaultResult = { success: true, code: "200", message: "", data: null };

  // If there's no token, user is not authenticated
  if (!userToken) {
    return defaultResult;
  }

  // Check cache first
  const now = Date.now();
  const cachedData = userCache[userToken];
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    return { ...defaultResult, data: cachedData.user };
  }

  try {
    // Fetch current user data using the token
    const response = await fetch(`${DATA_API_URL}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        accept: "*/*",
      },
    });

    if (!response.ok) {
      // Handle specific 401 (unauthorized) responses - token expired
      if (response.status === 401) {
        // Clear expired token from cache
        if (userToken && userCache[userToken]) {
          delete userCache[userToken];
        }
        return {
          success: false,
          code: "401",
          message: "Your session has expired. Please sign in again.",
          data: null,
        };
      }

      // For other errors, return default empty result
      return defaultResult;
    }

    const userData = await response.json();
    const user = transformApiUserToCompatibleFormat(userData);

    // Cache the result
    userCache[userToken] = {
      user,
      timestamp: now,
    };

    return { ...defaultResult, data: user };
  } catch (_error) {
    return defaultResult;
  }
}

async function getUser(request: Request): Promise<ApiUser | null> {
  return (await fetchCurrentUser(request)).data;
}

// Role-based access control helpers
function hasRole(user: ApiUser | null, role: string): boolean {
  if (!user || !user.role) return false;
  return (
    user.role.allowed_roles.includes(role) || user.role.default_role === role
  );
}

function isServices(user: ApiUser | null): boolean {
  return hasRole(user, "services");
}

function isAdmin(user: ApiUser | null): boolean {
  return hasRole(user, "admin");
}

function isManageable(user: ApiUser | null): boolean {
  return isServices(user) || isAdmin(user);
}

// Get magic string for wallet binding
async function fetchMagic(
  request?: Request,
): Promise<ResponseResult<MagicResponse>> {
  if (!isServerSide()) {
    return httpClient.get("/api/auth/magic");
  }

  const session = await getSession(request!);
  const userToken = session.get("userToken");

  if (!userToken) {
    return generateFailedResponse("Not authenticated", "401");
  }

  try {
    const response = await fetch(`${DATA_API_URL}/v1/auth/magic`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        accept: "*/*",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch magic string:", error);
      return generateFailedResponse(
        "Failed to fetch magic string",
        response.status.toString(),
      );
    }

    const data = await response.json();
    return {
      success: true,
      code: "200",
      message: "Magic string fetched successfully",
      data,
    };
  } catch (error) {
    console.error("Magic fetch error:", error);
    return generateFailedResponse(
      "An error occurred while fetching magic string",
    );
  }
}

// Bind wallet address to user account
async function bindWallet(
  walletBindData: WalletBindRequest,
  request?: Request,
): Promise<ResponseResult<WalletBindResponse>> {
  if (!isServerSide()) {
    return httpClient.post("/api/auth/bind/wallet", walletBindData);
  }

  const session = await getSession(request!);
  const userToken = session.get("userToken");

  if (!userToken) {
    return generateFailedResponse("Not authenticated", "401");
  }

  try {
    const response = await fetch(`${DATA_API_URL}/v1/auth/bind/wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
        accept: "*/*",
      },
      body: JSON.stringify(walletBindData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Wallet binding failed:", error);
      return generateFailedResponse(
        "Failed to bind wallet",
        response.status.toString(),
      );
    }

    const data = await response.json();

    // Invalidate user cache after successful binding
    if (userToken && userCache[userToken]) {
      delete userCache[userToken];
    }

    return {
      success: true,
      code: "200",
      message: "Wallet bound successfully",
      data,
    };
  } catch (error) {
    console.error("Wallet binding error:", error);
    return generateFailedResponse("An error occurred while binding wallet");
  }
}

export {
  signInWithGitHub,
  signOut,
  fetchCurrentUser,
  getUser,
  fetchMagic,
  bindWallet,
  hasRole,
  isServices,
  isAdmin,
  isManageable,
};

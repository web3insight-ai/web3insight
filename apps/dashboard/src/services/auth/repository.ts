import type { ResponseResult } from "@/types";
import { getSession, clearSession } from "./helper/server";

import type { ApiUser, UserBind } from "./typing";
import { env } from "@/env";

function generateFailedResponse<T = unknown>(
  message: string,
  code: string = "500",
  data?: T,
): ResponseResult<T> {
  return {
    success: false,
    message,
    code,
    data: data as T,
  };
}

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

  const githubBind = binds.find((bind) => bind.bind_type === "github");
  const emailBind = binds.find((bind) => bind.bind_type === "email");

  const typedBinds: UserBind[] = binds.map((bind) => ({
    bind_key: bind.bind_key,
    bind_type: bind.bind_type as "github" | "email" | "wallet",
  }));

  return {
    profile,
    binds: typedBinds,
    role,
    id: profile.user_id,
    username: githubBind?.bind_key || profile.user_nick_name,
    email: emailBind?.bind_key || "",
    provider: "privy",
    confirmed: true,
    blocked: false,
    avatar_url: profile.user_avatar,
  };
}

async function signOut(): Promise<ResponseResult<string>> {
  const session = await getSession();
  const cookieHeader = await clearSession(session);

  return {
    success: true,
    code: "200",
    data: cookieHeader,
    message: "",
  };
}

async function fetchCurrentUser(): Promise<ResponseResult<ApiUser | null>> {
  const session = await getSession();
  const userToken = session.get("userToken") as string | undefined;

  const defaultResult = { success: true, code: "200", message: "", data: null };

  if (!userToken) {
    return defaultResult;
  }

  try {
    const response = await fetch(`${DATA_API_URL}/rpc/auth/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
        accept: "*/*",
      },
      body: JSON.stringify({}),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          code: "401",
          message: "Your session has expired. Please sign in again.",
          data: null,
        };
      }
      return defaultResult;
    }

    const profile = await response.json();
    const user = transformApiUserToCompatibleFormat({
      profile: {
        user_id: String(profile.id),
        user_nick_name: profile.user_nick_name ?? "",
        user_avatar: profile.user_avatar ?? "",
        created_at: profile.created_at ?? "",
        updated_at: profile.updated_at ?? "",
      },
      binds: [],
      role: {
        allowed_roles: ["user"],
        default_role: "user",
        user_id: String(profile.id),
      },
    });

    return { ...defaultResult, data: user };
  } catch {
    return defaultResult;
  }
}

async function getUser(): Promise<ApiUser | null> {
  return (await fetchCurrentUser()).data;
}

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

export {
  generateFailedResponse,
  signOut,
  fetchCurrentUser,
  getUser,
  hasRole,
  isServices,
  isAdmin,
  isManageable,
};

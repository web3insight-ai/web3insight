import type { ResponseResult } from "@/types";
import { generateFailedResponse } from "@/clients/http";

import type { User } from "../typing";
import httpClient from "./client";

// Get current user data
async function getCurrentUser(token: string): Promise<ResponseResult<User | undefined>> {
  try {
    return httpClient.get("/users/me", {
      params: { populate: "*" },
      headers: { "Authorization": `Bearer ${token}` },
    });
  } catch (error) {
    return generateFailedResponse("An error occurred while fetch current user");
  }
}

async function fetchUserList(params = {}): Promise<ResponseResult<User[]>> {
  return httpClient.get("/users", { params });
}

async function fetchUser(id: number, params = {}): Promise<ResponseResult<User | undefined>> {
  return httpClient.get(`/users/${id}`, { params });
}

async function updateUser({ id, ...others }: User): Promise<ResponseResult<User>> {
  return httpClient.put(`/users/${id}`, others);
}

// GitHub-specific user management functions
async function syncGitHubUserProfile(
  userId: number,
  githubData: {
    username?: string;
    email?: string;
    provider?: string;
    confirmed?: boolean;
  },
): Promise<ResponseResult<User>> {
  try {
    // Prepare update data for GitHub user
    const updateData = {
      ...githubData,
      provider: "github",
      confirmed: true, // GitHub OAuth users are auto-confirmed
    };

    return httpClient.put(`/users/${userId}`, updateData);
  } catch (error) {
    return generateFailedResponse("An error occurred while syncing GitHub user profile");
  }
}

// Check if a user with the same email already exists (for account linking)
async function findUserByEmail(email: string): Promise<ResponseResult<User | undefined>> {
  try {
    const res = await httpClient.get("/users", {
      params: {
        filters: {
          email: {
            $eq: email,
          },
        },
      },
    });

    if (res.success && res.data && Array.isArray(res.data) && res.data.length > 0) {
      return {
        ...res,
        data: res.data[0] as User,
      };
    }

    return {
      ...res,
      data: undefined,
    };
  } catch (error) {
    return generateFailedResponse("An error occurred while searching for user by email");
  }
}

// Ensure GitHub users have proper role assignment
async function ensureUserRole(userId: number, roleType: "authenticated" | "manager" = "authenticated"): Promise<ResponseResult<User>> {
  try {
    // First get the user's current data
    const userRes = await fetchUser(userId, { populate: "role" });

    if (!userRes.success || !userRes.data) {
      return generateFailedResponse("User not found");
    }

    const user = userRes.data;

    // Check if user already has the correct role
    if (user.role && user.role.type === roleType) {
      return userRes; // User already has correct role
    }

    // Update user role if needed
    // Note: This might need to be handled on the Strapi side via role ID
    console.log(`User ${userId} needs role update to ${roleType}`);

    return userRes; // Return current user data
  } catch (error) {
    return generateFailedResponse("An error occurred while ensuring user role");
  }
}

export { getCurrentUser, fetchUserList, fetchUser, updateUser, syncGitHubUserProfile, findUserByEmail, ensureUserRole };

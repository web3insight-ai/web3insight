import { os, ORPCError } from "@orpc/server"
import { z } from "zod"
import { cookies } from "next/headers"
import type { ORPCContext } from "./context"
import {
  ecosystemSchema,
  apiUserSchema,
  authResponseSchema,
  privyAuthInputSchema,
  updateProfileDataSchema,
  twitterUserDataSchema,
  githubUserDataSchema,
  openbuildBindInputSchema,
  ecosystemScoreItemSchema,
} from "@/schemas/auth.schema"

// Create base procedure with context
const baseProcedure = os.$context<ORPCContext>()

// Protected procedure that requires auth
const protectedProcedure = baseProcedure.use(async ({ context, next }) => {
  if (!context.authToken) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication required",
    })
  }
  return next({
    context: { ...context, authToken: context.authToken },
  })
})

// Helper function to process inviter data from API response
function processInviterData(inviterData: any): z.infer<typeof apiUserSchema>["inviter"] {
  if (!inviterData) return null

  // Handle invite relationship structure from API
  // API returns: { id, invite_source_uid, invite_source_id, invite_source_type, invite_uid, ... }
  return {
    id: inviterData.id || "",
    invite_source_uid: inviterData.invite_source_uid,
    invite_source_id: inviterData.invite_source_id,
    invite_source_type: inviterData.invite_source_type,
    invite_uid: inviterData.invite_uid,
    // These may be populated later from fetching inviter's profile
    nick_name: inviterData.nick_name || inviterData.user_nick_name,
    user_avatar: inviterData.user_avatar,
    github_login: inviterData.github_login || inviterData.github || "",
  }
}

// Helper function to process user data from API response
function processUserData(userData: any): z.infer<typeof apiUserSchema> | null {
  if (!userData) return null

  if (userData.profile) {
    let githubLogin = ""
    if (userData.github) {
      githubLogin = userData.github
    } else if (userData.profile.github_login) {
      githubLogin = userData.profile.github_login
    } else if (userData.binds && Array.isArray(userData.binds)) {
      const githubBind = userData.binds.find(
        (bind: any) =>
          bind.bind_type === "github" || bind.bind_type === "github_oauth"
      )
      if (githubBind) {
        githubLogin = githubBind.bind_key || ""
      }
    }

    // Process inviter data if available
    const inviter = processInviterData(userData.inviter)

    return {
      id: userData.profile.user_id || userData.user_id,
      nick_name: userData.profile.user_nick_name,
      user_avatar: userData.profile.user_avatar,
      user_bio: userData.profile.user_bio,
      user_title: userData.profile.user_title || "",
      user_custom_x: userData.profile.user_custom_x,
      user_custom_labels: userData.profile.user_custom_labels,
      invite_code: userData.profile.invite_code,
      inviter,
      github_login: githubLogin,
      created_at: userData.profile.created_at,
      updated_at: userData.profile.updated_at,
    }
  }

  if (!userData.id && userData.user_id) {
    return { ...userData, id: userData.user_id }
  }

  // Handle flat structure with inviter
  if (userData.inviter) {
    return {
      ...userData,
      inviter: processInviterData(userData.inviter),
    }
  }

  return userData
}

// Auth procedures
const signInWithPrivy = baseProcedure
  .input(privyAuthInputSchema)
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: authResponseSchema.optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v1/auth/privy/token/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ id_token: input.idToken }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to authenticate with Privy: ${error}`,
      }
    }

    const authData = await response.json()

    if (!authData.token) {
      return {
        success: false,
        code: "500",
        message: "Invalid authentication response from server",
      }
    }

    // Fetch user profile using the backend token
    const userResponse = await fetch(`${context.dataApiUrl}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authData.token}`,
        accept: "*/*",
      },
    })

    if (!userResponse.ok) {
      return {
        success: false,
        code: userResponse.status.toString(),
        message: "Failed to fetch user profile",
      }
    }

    const userData = await userResponse.json()
    const processedUserData = processUserData(userData)

    // Set the backend token as an HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", authData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return {
      success: true,
      code: "200",
      message: "Privy authentication successful",
      data: {
        token: authData.token,
        user: processedUserData!,
      },
    }
  })

const getCurrentUser = baseProcedure
  .input(z.object({ ecosystem: ecosystemSchema }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: apiUserSchema.nullable(),
    })
  )
  .handler(async ({ input, context }) => {
    if (!context.authToken) {
      return { success: true, code: "200", message: "", data: null }
    }

    // First, get user ID from v1 auth endpoint
    const userResponse = await fetch(`${context.dataApiUrl}/v1/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.authToken}`,
        accept: "*/*",
      },
    })

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        const cookieStore = await cookies()
        cookieStore.delete("auth-token")
      }
      return { success: true, code: "200", message: "", data: null }
    }

    const userData = await userResponse.json()
    const userId = userData?.profile?.user_id || userData?.user_id

    if (!userId) {
      return { success: true, code: "200", message: "", data: null }
    }

    // Check if OpenBuild is bound from v1 binds data
    let openbuildBound = false
    if (userData.binds && Array.isArray(userData.binds)) {
      openbuildBound = userData.binds.some(
        (bind: any) => bind.bind_type === "openbuild"
      )
    }

    // Use v2 API for ecosystem-specific data
    const v2Response = await fetch(
      `${context.dataApiUrl}/v2/auth/user/info/${input.ecosystem}/${userId}`,
      {
        method: "GET",
        headers: { accept: "*/*" },
      }
    )

    if (!v2Response.ok) {
      // v2 API failed, return basic info for user to create profile
      let githubLogin = ""
      if (userData.profile?.github_login) {
        githubLogin = userData.profile.github_login
      } else if (userData.binds && Array.isArray(userData.binds)) {
        const githubBind = userData.binds.find(
          (bind: any) =>
            bind.bind_type === "github" || bind.bind_type === "github_oauth"
        )
        if (githubBind) {
          githubLogin = githubBind.bind_key || ""
        }
      }

      return {
        success: true,
        code: "200",
        message: "",
        data: {
          id: userId,
          nick_name: "",
          user_avatar: "",
          user_bio: "",
          user_title: "",
          user_custom_x: "",
          user_custom_labels: [],
          github_login: githubLogin,
          openbuild_bound: openbuildBound,
        },
      }
    }

    const v2Data = await v2Response.json()
    const processedV2Data = processUserData(v2Data)

    return {
      success: true,
      code: "200",
      message: "",
      data: processedV2Data ? { ...processedV2Data, openbuild_bound: openbuildBound } : null,
    }
  })

const logout = baseProcedure
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
    })
  )
  .handler(async () => {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    return {
      success: true,
      code: "200",
      message: "Logged out successfully",
    }
  })

const updateProfile = protectedProcedure
  .input(
    z.object({
      ecosystem: ecosystemSchema,
      data: updateProfileDataSchema,
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: apiUserSchema.optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v2/auth/user/info/${input.ecosystem}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.authToken}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(input.data),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to update profile: ${error}`,
      }
    }

    const userData = await response.json()
    const processedUserData = processUserData(userData)

    return {
      success: true,
      code: "200",
      message: "Profile updated successfully",
      data: processedUserData!,
    }
  })

const getUserByIdAndEcosystem = baseProcedure
  .input(
    z.object({
      ecosystem: ecosystemSchema,
      id: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: apiUserSchema.nullable(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v2/auth/user/info/${input.ecosystem}/${input.id}`,
      {
        method: "GET",
        headers: { accept: "*/*" },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch user profile: ${error}`,
        data: null,
      }
    }

    const userData = await response.json()
    const processedUserData = processUserData(userData)

    return {
      success: true,
      code: "200",
      message: "",
      data: processedUserData,
    }
  })

// GitHub procedures
const getGitHubUserByUsername = baseProcedure
  .input(z.object({ username: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: githubUserDataSchema.extend({ ecosystems: z.array(z.string()) }).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v2/external/github/users/username/${input.username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch GitHub user data: ${error}`,
      }
    }

    const githubData = await response.json()

    let ecosystemNames: string[] = []
    if (githubData.eco_score?.ecosystems) {
      ecosystemNames = githubData.eco_score.ecosystems
        .filter(
          (eco: any) =>
            eco.ecosystem && eco.ecosystem !== "ALL" && eco.ecosystem !== "General"
        )
        .map((eco: any) => eco.ecosystem)
    }

    return {
      success: true,
      code: "200",
      message: "GitHub user data retrieved successfully",
      data: { ...githubData, ecosystems: ecosystemNames },
    }
  })

const getGitHubUserById = baseProcedure
  .input(z.object({ id: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: githubUserDataSchema.extend({ ecosystems: z.array(z.string()) }).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v2/external/github/users/id/${input.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch GitHub user data: ${error}`,
      }
    }

    const githubData = await response.json()

    let ecosystemNames: string[] = []
    if (githubData.eco_score?.ecosystems) {
      ecosystemNames = githubData.eco_score.ecosystems
        .filter(
          (eco: any) =>
            eco.ecosystem && eco.ecosystem !== "ALL" && eco.ecosystem !== "General"
        )
        .map((eco: any) => eco.ecosystem)
    }

    return {
      success: true,
      code: "200",
      message: "GitHub user data retrieved successfully",
      data: { ...githubData, ecosystems: ecosystemNames },
    }
  })

// Twitter procedures
const getTwitterUser = baseProcedure
  .input(z.object({ username: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: twitterUserDataSchema.optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const variables = JSON.stringify({ screen_name: input.username })
    const encodedVariables = encodeURIComponent(variables)
    const operationId = "xxxxxxx"

    const response = await fetch(
      `${context.twitterApiUrl}/i/api/graphql/${operationId}/UserByScreenName?variables=${encodedVariables}`,
      {
        method: "GET",
        headers: { accept: "*/*" },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch Twitter user data: ${error}`,
      }
    }

    const twitterData = await response.json()

    const result = twitterData?.data?.user?.result
    const user = result?.legacy
    const bio = user?.description || ""

    // Get avatar from the correct path
    let avatarUrl = result?.avatar?.image_url || user?.profile_image_url_https || ""

    // Replace _normal with _400x400 for higher quality image
    if (avatarUrl && avatarUrl.includes("_normal.")) {
      avatarUrl = avatarUrl.replace("_normal.", "_400x400.")
    }

    return {
      success: true,
      code: "200",
      message: "Twitter user data retrieved successfully",
      data: {
        username: input.username,
        bio,
        name: result?.core?.name || user?.name || "",
        avatar: avatarUrl,
      },
    }
  })

// OpenBuild procedures
const bindOpenBuild = protectedProcedure
  .input(openbuildBindInputSchema)
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v1/auth/bind/openbuild`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.authToken}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ code: input.code }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to bind OpenBuild: ${error}`,
      }
    }

    return {
      success: true,
      code: "200",
      message: "OpenBuild account bound successfully",
    }
  })

const getOpenBuildRecord = protectedProcedure
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.any().optional(),
    })
  )
  .handler(async ({ context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v1/auth/openbuild/record`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${context.authToken}`,
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch OpenBuild record: ${error}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      code: "200",
      message: "OpenBuild record retrieved successfully",
      data,
    }
  })

// Full GitHub user data with ecosystem scores
const getFullGitHubUser = baseProcedure
  .input(z.object({ username: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.any().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v2/external/github/users/username/${input.username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch GitHub user data: ${error}`,
      }
    }

    const githubData = await response.json()

    // Process ecosystem scores
    let ecosystemNames: string[] = []
    let ecosystemScores: z.infer<typeof ecosystemScoreItemSchema>[] = []
    if (githubData.eco_score?.ecosystems) {
      const filtered = githubData.eco_score.ecosystems.filter(
        (eco: any) =>
          eco.ecosystem && eco.ecosystem !== "ALL" && eco.ecosystem !== "General"
      )
      ecosystemNames = filtered.map((eco: any) => eco.ecosystem)
      ecosystemScores = filtered.map((eco: any) => ({
        ecosystem: eco.ecosystem,
        total_score: eco.total_score || 0,
        repos: eco.repos || [],
        last_activity_at: eco.last_activity_at,
        first_activity_at: eco.first_activity_at,
      }))
    }

    return {
      success: true,
      code: "200",
      message: "Full GitHub user data retrieved successfully",
      data: {
        ...githubData,
        ecosystems: ecosystemNames,
        ecosystem_scores: ecosystemScores,
      },
    }
  })

// Analysis procedures
const startAnalysis = protectedProcedure
  .input(
    z.object({
      githubUrl: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.object({
        id: z.union([z.string(), z.number()]),
      }).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v1/custom/analysis/users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.authToken}`,
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          intent: "profile",
          request_data: [input.githubUrl],
          description: "DevCard analysis",
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to start analysis: ${error}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      code: "200",
      message: "Analysis started",
      data: { id: data.id },
    }
  })

const getAnalysisResult = baseProcedure
  .input(
    z.object({
      id: z.union([z.string(), z.number()]),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.any().optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const response = await fetch(
      `${context.dataApiUrl}/v1/custom/analysis/users/${input.id}`,
      {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: response.status.toString(),
        message: `Failed to fetch analysis result: ${error}`,
      }
    }

    const data = await response.json()

    return {
      success: true,
      code: "200",
      message: "Analysis result retrieved",
      data,
    }
  })

// Create the router
export const router = {
  auth: {
    signInWithPrivy,
    getCurrentUser,
    logout,
    updateProfile,
    getUserByIdAndEcosystem,
    bindOpenBuild,
    getOpenBuildRecord,
  },
  github: {
    getUserByUsername: getGitHubUserByUsername,
    getUserById: getGitHubUserById,
    getFullUser: getFullGitHubUser,
  },
  twitter: {
    getUserByUsername: getTwitterUser,
  },
  analysis: {
    start: startAnalysis,
    getResult: getAnalysisResult,
  },
}

export type AppRouter = typeof router

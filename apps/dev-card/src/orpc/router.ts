import { os, ORPCError } from "@orpc/server"
import { z } from "zod"
import { cookies } from "next/headers"
import type { ORPCContext } from "./context"
import { createBackendClient } from "./backend"
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

/**
 * Map an oRPC ORPCError into the legacy `{success, code, message}` envelope
 * the dev-card UI expects. Non-oRPC errors still surface as success:false.
 */
function rpcErrorEnvelope(error: unknown, defaultMessage: string) {
  if (error instanceof ORPCError) {
    return {
      success: false as const,
      code: error.status?.toString() ?? error.code ?? "500",
      message: error.message || defaultMessage,
    }
  }
  return {
    success: false as const,
    code: "500",
    message: error instanceof Error ? error.message : defaultMessage,
  }
}

// --- Auth procedures -------------------------------------------------------

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
  .handler(async ({ input }) => {
    // Step 1: exchange Privy id_token for backend JWT
    let token: string
    try {
      const { client } = createBackendClient()
      const authResult = await client.auth.privyTokenAuth({
        id_token: input.idToken,
      })
      if (!authResult?.token) {
        return {
          success: false,
          code: "500",
          message: "Invalid authentication response from server",
        }
      }
      token = authResult.token
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to authenticate with Privy")
    }

    // Step 2: fetch user profile using the new token
    let userData: any
    try {
      const { client: authedClient } = createBackendClient(token)
      userData = await authedClient.auth.me()
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch user profile")
    }

    const processedUserData = processUserData(userData)

    // Step 3: set the backend token as an HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
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
        token,
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

    // Step 1: identify user via /auth/me. 401 = stale cookie; clear and bail.
    let userData: any
    try {
      const { client } = createBackendClient(context.authToken)
      userData = await client.auth.me()
    } catch (error) {
      if (error instanceof ORPCError && error.status === 401) {
        const cookieStore = await cookies()
        cookieStore.delete("auth-token")
      }
      return { success: true, code: "200", message: "", data: null }
    }

    const userId: number | string | undefined =
      userData?.profile?.user_id ?? userData?.user_id
    if (!userId) {
      return { success: true, code: "200", message: "", data: null }
    }

    const openbuildBound =
      Array.isArray(userData?.binds) &&
      userData.binds.some((bind: any) => bind.bind_type === "openbuild")

    // Step 2: ecosystem-specific profile. Missing = let user create one.
    try {
      const { client } = createBackendClient(context.authToken)
      const v2Data = await client.auth.getUserByTagAndId({
        tag: input.ecosystem,
        id: String(userId),
      })
      const processed = processUserData(v2Data)
      return {
        success: true,
        code: "200",
        message: "",
        data: processed
          ? { ...processed, openbuild_bound: openbuildBound }
          : null,
      }
    } catch {
      // Fallback shape: enough to bootstrap profile creation in the UI.
      let githubLogin = ""
      if (userData.profile?.github_login) {
        githubLogin = userData.profile.github_login
      } else if (Array.isArray(userData.binds)) {
        const githubBind = userData.binds.find(
          (bind: any) =>
            bind.bind_type === "github" || bind.bind_type === "github_oauth"
        )
        if (githubBind) githubLogin = githubBind.bind_key || ""
      }
      return {
        success: true,
        code: "200",
        message: "",
        data: {
          id: String(userId),
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
    try {
      const { client } = createBackendClient(context.authToken)
      await client.auth.updateUserByTag({
        tag: input.ecosystem,
        data: input.data,
      })

      // Re-fetch the profile post-write so the UI gets the canonical shape.
      const userId = (await client.auth.me())?.id
      const refreshed = userId
        ? await client.auth.getUserByTagAndId({
            tag: input.ecosystem,
            id: String(userId),
          })
        : null
      const processed = processUserData(refreshed)
      return {
        success: true,
        code: "200",
        message: "Profile updated successfully",
        data: processed ?? undefined,
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to update profile")
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
  .handler(async ({ input }) => {
    try {
      const { client } = createBackendClient()
      const userData = await client.auth.getUserByTagAndId({
        tag: input.ecosystem,
        id: input.id,
      })
      return {
        success: true,
        code: "200",
        message: "",
        data: processUserData(userData),
      }
    } catch (error) {
      return { ...rpcErrorEnvelope(error, "Failed to fetch user profile"), data: null }
    }
  })

// --- GitHub procedures -----------------------------------------------------

function extractEcosystemNames(githubData: any): string[] {
  if (!githubData?.eco_score?.ecosystems) return []
  return githubData.eco_score.ecosystems
    .filter(
      (eco: any) =>
        eco.ecosystem && eco.ecosystem !== "ALL" && eco.ecosystem !== "General"
    )
    .map((eco: any) => eco.ecosystem)
}

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
  .handler(async ({ input }) => {
    try {
      const { client } = createBackendClient()
      const githubData = await client.custom.externalGithubByUsername({
        username: input.username,
      })
      return {
        success: true,
        code: "200",
        message: "GitHub user data retrieved successfully",
        data: { ...(githubData as any), ecosystems: extractEcosystemNames(githubData) },
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch GitHub user data")
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
  .handler(async ({ input }) => {
    try {
      const { client } = createBackendClient()
      const githubData = await client.custom.externalGithubById({ id: input.id })
      return {
        success: true,
        code: "200",
        message: "GitHub user data retrieved successfully",
        data: { ...(githubData as any), ecosystems: extractEcosystemNames(githubData) },
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch GitHub user data")
    }
  })

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
  .handler(async ({ input }) => {
    try {
      const { client } = createBackendClient()
      const githubData: any = await client.custom.externalGithubByUsername({
        username: input.username,
      })
      let ecosystemNames: string[] = []
      let ecosystemScores: z.infer<typeof ecosystemScoreItemSchema>[] = []
      if (githubData?.eco_score?.ecosystems) {
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
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch GitHub user data")
    }
  })

// --- Twitter procedure (external API — stays raw fetch) -------------------

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

    let avatarUrl = result?.avatar?.image_url || user?.profile_image_url_https || ""
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

// --- OpenBuild procedures --------------------------------------------------

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
    try {
      const { client } = createBackendClient(context.authToken)
      await client.auth.bindOpenBuild({ code: input.code })
      return {
        success: true,
        code: "200",
        message: "OpenBuild account bound successfully",
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to bind OpenBuild")
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
    try {
      const { client } = createBackendClient(context.authToken)
      const data = await client.auth.getOpenBuildRecord()
      return {
        success: true,
        code: "200",
        message: "OpenBuild record retrieved successfully",
        data,
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch OpenBuild record")
    }
  })

// --- Analysis procedures ---------------------------------------------------

const startAnalysis = protectedProcedure
  .input(z.object({ githubUrl: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.object({ id: z.union([z.string(), z.number()]) }).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const { client } = createBackendClient(context.authToken)
      const data = await client.custom.createAnalysis({
        intent: "profile",
        request_data: [input.githubUrl],
        description: "DevCard analysis",
      })
      return {
        success: true,
        code: "200",
        message: "Analysis started",
        data: { id: data.id },
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to start analysis")
    }
  })

const getAnalysisResult = baseProcedure
  .input(z.object({ id: z.union([z.string(), z.number()]) }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.any().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { client } = createBackendClient()
      const data = await client.custom.getAnalysis({ id: Number(input.id) })
      return {
        success: true,
        code: "200",
        message: "Analysis result retrieved",
        data,
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to fetch analysis result")
    }
  })

// --- User extra data -------------------------------------------------------

const getUserExtra = protectedProcedure
  .input(z.object({ tag: ecosystemSchema }))
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
      data: z.any().nullable(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const { client } = createBackendClient(context.authToken)
      const data = await client.auth.getUserExtra({ tag: input.tag })
      // Reason: backend returns { user_id, user_info_type, user_extra, updated_at }
      // where user_extra may be a JSON string or object depending on driver.
      const userExtra = (data as any)?.user_extra ?? null
      const parsed =
        typeof userExtra === "string" ? JSON.parse(userExtra) : userExtra
      return {
        success: true,
        code: "200",
        message: "User extra data retrieved successfully",
        data: parsed,
      }
    } catch (error) {
      return { ...rpcErrorEnvelope(error, "Failed to fetch user extra data"), data: null }
    }
  })

const updateUserExtra = protectedProcedure
  .input(
    z.object({
      tag: ecosystemSchema,
      user_extra: z.any(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      code: z.string(),
      message: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    try {
      const { client } = createBackendClient(context.authToken)
      await client.auth.updateUserExtra({
        tag: input.tag,
        data: { user_extra: input.user_extra },
      })
      return {
        success: true,
        code: "200",
        message: "User extra data updated successfully",
      }
    } catch (error) {
      return rpcErrorEnvelope(error, "Failed to update user extra data")
    }
  })

// --- Router ----------------------------------------------------------------

export const router = {
  auth: {
    signInWithPrivy,
    getCurrentUser,
    logout,
    updateProfile,
    getUserByIdAndEcosystem,
    bindOpenBuild,
    getOpenBuildRecord,
    getUserExtra,
    updateUserExtra,
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

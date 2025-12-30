import { z } from "zod"

// Ecosystem type
export const ecosystemSchema = z.enum(["monad", "mantle"])
export type Ecosystem = z.infer<typeof ecosystemSchema>

// Inviter schema (invite relationship info)
export const inviterSchema = z.object({
  id: z.string(),
  invite_source_uid: z.string().optional(),
  invite_source_id: z.string().optional(),
  invite_source_type: z.string().optional(),
  invite_uid: z.string().optional(),
  // These are populated from fetching the inviter's profile
  nick_name: z.string().optional(),
  user_avatar: z.string().optional(),
  github_login: z.string().optional(),
})

export type Inviter = z.infer<typeof inviterSchema>

// API User schema
export const apiUserSchema = z.object({
  id: z.string(),
  nick_name: z.string().optional(),
  user_avatar: z.string().optional(),
  user_bio: z.string().optional(),
  user_title: z.string().optional(),
  github_login: z.string().optional(),
  google_email: z.string().optional(),
  user_custom_x: z.string().optional(),
  user_custom_labels: z.array(z.string()).optional(),
  invite_code: z.string().optional(),
  inviter: inviterSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type ApiUser = z.infer<typeof apiUserSchema>

// Auth response schema
export const authResponseSchema = z.object({
  token: z.string(),
  user: apiUserSchema,
})

export type ApiAuthResponse = z.infer<typeof authResponseSchema>

// Privy sign in input
export const privyAuthInputSchema = z.object({
  idToken: z.string().min(1, "ID token is required"),
})

export type PrivyAuthInput = z.infer<typeof privyAuthInputSchema>

// Update profile input
export const updateProfileDataSchema = z.object({
  user_nick_name: z.string().optional(),
  user_avatar: z.string().optional(),
  user_bio: z.string().max(100, "Bio must be 100 characters or less").optional(),
  user_title: z.string().max(25, "Title must be 25 characters or less").optional(),
  user_custom_x: z.string().optional(),
  user_custom_labels: z.array(z.string()).max(6).optional(),
  github_login: z.string().optional(),
  invite_code: z.string().optional(),
})

export const updateProfileInputSchema = z.object({
  ecosystem: ecosystemSchema,
  data: updateProfileDataSchema,
})

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
export type UpdateProfileData = z.infer<typeof updateProfileDataSchema>

// GitHub user data schema
export const githubUserDataSchema = z.object({
  id: z.number().optional(),
  login: z.string().optional(),
  actor_id: z.string().optional(),
  actor_login: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
  public_repos: z.number().optional(),
  followers: z.number().optional(),
  following: z.number().optional(),
  ecosystems: z.array(z.string()).optional(),
})

export type GitHubUserData = z.infer<typeof githubUserDataSchema>

// Twitter user data schema
export const twitterUserDataSchema = z.object({
  username: z.string(),
  bio: z.string(),
  name: z.string(),
  avatar: z.string(),
})

export type TwitterUserData = z.infer<typeof twitterUserDataSchema>

// User ecosystems data schema
export const userEcosystemDataSchema = z.object({
  ecosystems: z.array(z.string()),
  repositories: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    language: z.string().optional(),
    topics: z.array(z.string()).optional(),
    ecosystem: z.string().optional(),
  })).optional(),
})

export type UserEcosystemData = z.infer<typeof userEcosystemDataSchema>

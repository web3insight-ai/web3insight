import { z } from "zod"

// Ecosystem type
export const ecosystemSchema = z.enum(["monad", "mantle", "openbuild"])
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
  openbuild_bound: z.boolean().optional(),
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

// OpenBuild OAuth bind input
export const openbuildBindInputSchema = z.object({
  code: z.string().min(1, "OAuth code is required"),
})

export type OpenBuildBindInput = z.infer<typeof openbuildBindInputSchema>

// OpenBuild record data (from GET /v1/auth/openbuild/record)
// Using permissive schema since OpenBuild API response structure may vary
export const openbuildRecordItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string().optional(),
  type: z.string().optional(),
  image: z.string().optional(),
  img: z.string().optional(),
  course_series_count: z.number().optional(),
  course_single_count: z.number().optional(),
  enroll_count: z.number().optional(),
  view_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  status: z.union([z.string(), z.number()]).optional(),
}).passthrough()

export type OpenBuildRecordItem = z.infer<typeof openbuildRecordItemSchema>

export const openbuildRecordSchema = z.object({
  data: z.array(openbuildRecordItemSchema).optional(),
}).passthrough()

export type OpenBuildRecord = z.infer<typeof openbuildRecordSchema>

// Ecosystem score data (from GitHub API eco_score)
export const ecosystemRepoSchema = z.object({
  score: z.number(),
  repo_name: z.string(),
  last_activity_at: z.string().optional(),
  first_activity_at: z.string().optional(),
})

export const ecosystemScoreItemSchema = z.object({
  ecosystem: z.string(),
  total_score: z.number(),
  repos: z.array(ecosystemRepoSchema).optional(),
  last_activity_at: z.string().optional(),
  first_activity_at: z.string().optional(),
})

export type EcosystemScoreItem = z.infer<typeof ecosystemScoreItemSchema>

// Full GitHub user data with ecosystem scores
export const fullGitHubUserSchema = githubUserDataSchema.extend({
  avatar_url: z.string().optional(),
  html_url: z.string().optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  twitter_username: z.string().nullable().optional(),
  created_at: z.string().optional(),
  starred_url: z.string().optional(),
  ecosystems: z.array(z.string()).optional(),
  ecosystem_scores: z.array(ecosystemScoreItemSchema).optional(),
})

export type FullGitHubUser = z.infer<typeof fullGitHubUserSchema>

// AI Analysis roast report
export const aiRoastReportSchema = z.object({
  english: z.string().optional(),
  chinese: z.string().optional(),
})

export const aiAnalysisProfileSchema = z.object({
  bio: z.string().optional(),
  blog: z.string().optional(),
  name: z.string().optional(),
  stats: z.object({
    followers: z.union([z.string(), z.number()]).optional(),
    following: z.union([z.string(), z.number()]).optional(),
    totalScore: z.union([z.string(), z.number()]).optional(),
    publicRepos: z.union([z.string(), z.number()]).optional(),
  }).optional(),
  twitter: z.string().optional(),
  location: z.string().optional(),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  created_at: z.string().optional(),
})

export const aiAnalysisResultSchema = z.object({
  id: z.union([z.string(), z.number()]),
  intent: z.string().optional(),
  ai: z.object({
    success: z.boolean().optional(),
    timestamp: z.string().optional(),
    data: z.object({
      profile: aiAnalysisProfileSchema.optional(),
      roastReport: aiRoastReportSchema.optional(),
    }).optional(),
  }).nullable().optional(),
  github: z.object({
    users: z.array(z.any()).optional(),
  }).optional(),
  data: z.object({
    users: z.array(z.object({
      actor_id: z.string().optional(),
      ecosystem_scores: z.array(ecosystemScoreItemSchema).optional(),
    })).optional(),
  }).optional(),
  public: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type AIAnalysisResult = z.infer<typeof aiAnalysisResultSchema>

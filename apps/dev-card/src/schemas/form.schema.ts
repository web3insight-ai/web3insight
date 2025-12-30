import { z } from "zod"

// Dev Card form schema - base version for developers
export const devCardFormSchema = z.object({
  avatar: z.string().min(1, "Avatar is required"),
  name: z.string().min(1, "Name is required"),
  github: z.string().min(1, "GitHub username is required"),
  twitter: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(25, "Title must be 25 characters or less"),
  bio: z
    .string()
    .min(1, "Bio is required")
    .max(50, "Bio must be 50 characters or less"),
  buildingOn: z
    .array(z.string())
    .min(1, "At least one ecosystem must be selected")
    .max(6, "Maximum 6 ecosystems allowed"),
  inviteCode: z.string().optional(),
})

// Non-developer users require Twitter
export const devCardFormSchemaWithTwitter = devCardFormSchema.extend({
  twitter: z.string().min(1, "Twitter is required for non-developer accounts"),
})

export type DevCardFormValues = z.infer<typeof devCardFormSchema>

// Profile update form schema
export const profileUpdateFormSchema = z.object({
  user_nick_name: z.string().optional(),
  user_avatar: z.string().optional(),
  user_bio: z.string().max(50, "Bio must be 50 characters or less").optional(),
})

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateFormSchema>

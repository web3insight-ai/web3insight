import { z } from 'zod';
import { DirectionSchema } from './shared.js';

export const IntentSchema = z.enum(['hackathon', 'profile']);

export const CustomQueryUsersInputSchema = z.object({
  intent: IntentSchema.default('hackathon'),
  request_data: z.array(z.string()).default([]),
  description: z.string(),
});

export const CustomQueryUsersOrderInputSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  intent: IntentSchema.default('hackathon'),
  take: z.coerce.number().int().min(1).max(100).default(10),
  direction: DirectionSchema,
});

// Reason: dev-card analysis polling reads many derived fields (status, result,
// users[], etc.) populated by the analysis pipeline. `.loose()` lets the orpc
// client surface those without declaring each one here.
// `id` is a postgres bigint serialised as a string by the pg driver; `created_at`
// can arrive as a Date instance on internal calls — coerce both so historical
// rows pass output validation alongside fully-projected ones. `intent` and
// `share` are not selected by `getPublicList` (it returns only id/desc/created_at)
// so they are optional here.
export const ApiAnalysisUserSchema = z
  .object({
    id: z.coerce.number().int(),
    intent: IntentSchema.optional(),
    description: z.string().nullable(),
    share: z.boolean().optional(),
    created_at: z.coerce.string(),
  })
  .loose();

export const CustomQueryUsersListSchema = z.object({
  list: z.array(ApiAnalysisUserSchema),
  total: z.coerce.number().int().nonnegative(),
});

export const CustomUploadResponseSchema = z.object({
  id: z.number().int(),
  users: z.array(z.record(z.string(), z.unknown())),
  fail: z.array(z.string()),
});

export const CustomShareInputSchema = z.object({
  share: z.boolean().default(false),
});

// Reason: dev-card UI reads eco_score.ecosystems[], avatar_url, name, bio, and
// other fields from the external GitHub/profile responses. `.loose()` exposes
// them through the orpc client without enumerating every field here.
export const GithubUserSchema = z
  .object({
    login: z.string(),
    id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .loose();

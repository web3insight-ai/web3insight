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

// Reason: legacy uploadAndGetUsers returns a nested shape — the dashboard's
// analyzeUser reads `data.users.users[]` and other downstream fields the
// initial contract authoring did not enumerate. Coerce `id` (bigint string
// in postgres) and let the rest flow through with `.loose()` until the
// service has a stable projection worth pinning down.
export const CustomUploadResponseSchema = z
  .object({
    id: z.coerce.number().int(),
  })
  .loose();

export const CustomShareInputSchema = z.object({
  share: z.boolean().default(false),
});

// Output of the /v1/external/* + /v1/external/github/users/* endpoints.
// Three concrete shapes flow through here today:
//   - UsersService.getTopFormUserId(id)        → {} | { actor_id, actor_login, eco_score }
//   - UsersService.getTopFormGithubUserName(u) → same as getTopFormUserId (lookup-then-id)
//   - UsersService.getTopFormUserName(u)       → { username, actor_id?, top_ecosystems[], total_ecosystems?, message? }
// All fields optional + `.loose()` so the contract tolerates every variant
// without 500 "Output validation failed". Dashboard/dev-card already cast
// the response to their own typed views (EcoScoreApiResponse, githubUserDataSchema)
// so no consumer type breaks.
export const GithubUserSchema = z
  .object({
    actor_id: z.union([z.string(), z.number()]).optional(),
    actor_login: z.string().optional(),
    eco_score: z.object({}).loose().optional(),
    username: z.string().optional(),
    top_ecosystems: z.array(z.object({}).loose()).optional(),
    total_ecosystems: z.number().int().optional(),
    message: z.string().optional(),
  })
  .loose();

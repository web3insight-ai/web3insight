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

export const ApiAnalysisUserSchema = z.object({
  id: z.number().int(),
  intent: IntentSchema,
  description: z.string().nullable(),
  share: z.boolean(),
  created_at: z.string(),
});

export const CustomQueryUsersListSchema = z.object({
  list: z.array(ApiAnalysisUserSchema),
  total: z.number().int().nonnegative(),
});

export const CustomUploadResponseSchema = z.object({
  id: z.number().int(),
  users: z.array(z.record(z.string(), z.unknown())),
  fail: z.array(z.string()),
});

export const CustomShareInputSchema = z.object({
  share: z.boolean().default(false),
});

export const GithubUserSchema = z.object({
  login: z.string(),
  id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

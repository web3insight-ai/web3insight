import { z } from 'zod';
import { ReposOrderSchema } from './data.js';
import { EcoNameSchema, PositiveIdSchema, DirectionSchema, listResponseSchema, SuccessResponseSchema } from './shared.js';

export const ReposOrderInputSchema = z.object({
  order: ReposOrderSchema,
  eco_name: EcoNameSchema,
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(100),
  direction: DirectionSchema,
  search: z.string().max(50).optional(),
});

// Reason: data_repos.repo_id is a pg bigint serialised as string by the
// driver; repo_name + the JSONB mark columns can be NULL in older rows.
// Coerce to int and accept null defaults so the output validator stops
// rejecting valid DB rows.
export const RepoMarkSchema = z.object({
  repo_id: z.coerce.number().int(),
  repo_name: z.string().nullable().default(''),
  upstream_marks: z
    .record(z.string(), z.unknown())
    .nullable()
    .default({}),
  custom_marks: z
    .record(z.string(), z.unknown())
    .nullable()
    .default({}),
});

export const ReposMarkListSchema = z.object({
  list: z.array(RepoMarkSchema),
  total: z.number().int().nonnegative(),
});

export const ReposCustomMarkInputSchema = z.object({
  eco_name: EcoNameSchema,
  mark: z.coerce.number().int().min(0).max(10).default(1),
});

export const TestVersionInputSchema = z.object({
  version: z.string(),
});

export { PositiveIdSchema };
export { SuccessResponseSchema };
export { listResponseSchema };

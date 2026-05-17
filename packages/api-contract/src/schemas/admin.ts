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

export const RepoMarkSchema = z.object({
  repo_id: z.number().int(),
  repo_name: z.string(),
  upstream_marks: z.record(z.string(), z.unknown()).default({}),
  custom_marks: z.record(z.string(), z.unknown()).default({}),
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

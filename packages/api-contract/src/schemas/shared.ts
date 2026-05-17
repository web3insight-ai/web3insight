import { z } from 'zod';

/** ALL ecosystems sentinel, matches `ECO_ALL` constant in apps/api. */
export const ECO_ALL = 'all';

export const EcoNameSchema = z
  .string()
  .min(1)
  .describe('Ecosystem name or "all"')
  .default(ECO_ALL);

export const PaginationInputSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const DirectionSchema = z.enum(['asc', 'desc']).default('asc');

export const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export const PositiveIdSchema = z.coerce.number().int().min(1);

/** Wrap any item schema as `{ list: T[]; total?: number }` (legacy response format). */
export function listResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    list: z.array(itemSchema),
    total: z.number().int().nonnegative().optional(),
  });
}

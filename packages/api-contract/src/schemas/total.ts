import { z } from 'zod';

/** `TotalDto` — single count payload. */
export const TotalSchema = z.object({
  total: z.number().nonnegative(),
});

/** Per-date count item used in actor stats. */
export const ActorDateItemSchema = z.object({
  date: z.string().describe('ISO date string'),
  total: z.number().nonnegative(),
});

export const ActorDateListSchema = z.object({
  list: z.array(ActorDateItemSchema),
});

/** Single country actor count. */
export const ActorCountryStatItemSchema = z.object({
  country: z.string(),
  total: z.number().nonnegative(),
});

export const ActorCountryStatListSchema = z.object({
  total: z.number().nonnegative(),
  list: z.array(ActorCountryStatItemSchema),
});

export type TotalResponse = z.infer<typeof TotalSchema>;
export type ActorDateListResponse = z.infer<typeof ActorDateListSchema>;
export type ActorCountryStatListResponse = z.infer<typeof ActorCountryStatListSchema>;

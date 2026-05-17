import { z } from 'zod';

export const DonateRepoSchema = z.object({
  id: z.number().int(),
  repo_id: z.number().int(),
  repo_name: z.string(),
  description: z.string().nullable(),
  total_amount: z.number().nonnegative(),
  donor_count: z.number().int().nonnegative(),
  created_at: z.string(),
});

export const DonateRepoListSchema = z.object({
  list: z.array(DonateRepoSchema),
});

export const CreateDonateRepoInputSchema = z.object({
  repo_id: z.number().int(),
  repo_name: z.string().min(1),
  amount: z.coerce.number().positive(),
  tx_hash: z.string().optional(),
});

import { z } from 'zod';

// Reason: the legacy NestJS donate endpoint returned raw DB rows
// ({ repo_id: bigint-string, repo_info: jsonb, repo_donate_data: jsonb,
// submitter_id, created_at, updated_at }) and the dashboard pages render
// off those exact shapes. The original contract authored a cleaner shape
// (id/repo_name/total_amount/donor_count) that the implementation never
// emitted. Until a follow-up rewrites the service to project that view,
// keep the schemas permissive so output validation does not reject
// historical rows.
export const DonateRepoSchema = z.record(z.string(), z.unknown());

export const DonateRepoListSchema = z.array(DonateRepoSchema);

export const CreateDonateRepoInputSchema = z.object({
  repo_id: z.number().int(),
  repo_name: z.string().min(1),
  amount: z.coerce.number().positive(),
  tx_hash: z.string().optional(),
});

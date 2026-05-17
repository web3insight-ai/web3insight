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

// Reason: dashboard's "submit repo for donation" form posts a single
// `repo_full_name` (owner/repo). The backend donate service resolves
// repo_id by name and uses the authenticated user as submitter. Earlier
// schema authoring invented amount/tx_hash fields that the service never
// reads — keep the contract aligned with what the route actually consumes.
export const CreateDonateRepoInputSchema = z.object({
  repo_full_name: z.string().min(1),
});

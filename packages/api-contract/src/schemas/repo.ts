import { z } from 'zod';

// Kept for back-compat with imports elsewhere — not actually what
// `repo/activeDeveloper` returns. The contract used to claim its `list`
// items were `{repo_id}` rows; in reality the service streams the contents
// of the `data.repos.active_developers` JSONB column, which today is a
// time-series of `{month, developers}` points and may evolve.
export const GithubRepoSchema = z.object({}).loose();

// Reason: `data.repos.active_developers` is an opaque JSONB blob populated
// by the sync jobs (currently month/developer points; could grow other
// fields). Use `unknown` per item + `.loose()` so the contract tolerates
// any shape until the column gets a stable projection. Dashboard
// `RepoActiveDeveloperRecord` types this on the consumer side.
export const RepoActiveDevSchema = z
  .object({
    list: z.array(z.unknown()).default([]),
  })
  .loose();

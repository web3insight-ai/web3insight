import { z } from 'zod';

export const GithubRepoSchema = z.object({
  repo_id: z.number().int(),
});

export const RepoActiveDevSchema = z.object({
  list: z.array(GithubRepoSchema),
});

import { oc } from '@orpc/contract';
import { z } from 'zod';
import { RepoActiveDevSchema } from '../schemas/repo.js';

export const repoContract = oc.tag('Repo').router({
  /** GET /v1/repos/active/developer — RepoService.getRepoActiveDevelopers(repoId) */
  activeDeveloper: oc
    .route({ method: 'GET', path: '/repos/active/developer' })
    .input(z.object({ repo_id: z.coerce.number().int().positive() }))
    .output(RepoActiveDevSchema),
});

export type RepoContract = typeof repoContract;

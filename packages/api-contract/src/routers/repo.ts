import { oc } from '@orpc/contract';
import { z } from 'zod';
import { EcoNameSchema } from '../schemas/shared.js';
import { RepoActiveDevSchema } from '../schemas/repo.js';

export const repoContract = oc.tag('Repo').router({
  /** GET /v1/repos/active/developer */
  activeDeveloper: oc
    .route({ method: 'GET', path: '/repos/active/developer' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(RepoActiveDevSchema),
});

export type RepoContract = typeof repoContract;

import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  ReposOrderInputSchema,
  ReposMarkListSchema,
  ReposCustomMarkInputSchema,
  TestVersionInputSchema,
  PositiveIdSchema,
  SuccessResponseSchema,
} from '../schemas/admin.js';

export const adminContract = oc.tag('Admin').router({
  /** GET /v1/admin/ecosystems */
  listEcosystems: oc
    .route({ method: 'GET', path: '/admin/ecosystems' })
    .output(z.object({ list: z.array(z.string()) })),

  /** GET /v1/admin/ecosystems/repos */
  listEcosystemRepos: oc
    .route({ method: 'GET', path: '/admin/ecosystems/repos' })
    .input(ReposOrderInputSchema)
    .output(ReposMarkListSchema),

  /** POST /v1/admin/ecosystems/repos/:id/mark */
  markEcosystemRepo: oc
    .route({ method: 'POST', path: '/admin/ecosystems/repos/{id}/mark' })
    .input(z.object({ id: PositiveIdSchema, data: ReposCustomMarkInputSchema }))
    .output(SuccessResponseSchema),

  /** POST /v1/admin/test/version */
  testVersion: oc
    .route({ method: 'POST', path: '/admin/test/version' })
    .input(TestVersionInputSchema)
    .output(SuccessResponseSchema),
});

export type AdminContract = typeof adminContract;

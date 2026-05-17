import { oc } from '@orpc/contract';
import { z } from 'zod';
import { PositiveIdSchema, SuccessResponseSchema } from '../schemas/shared.js';
import {
  CustomQueryUsersInputSchema,
  CustomQueryUsersOrderInputSchema,
  CustomQueryUsersListSchema,
  CustomUploadResponseSchema,
  CustomShareInputSchema,
  ApiAnalysisUserSchema,
  GithubUserSchema,
} from '../schemas/custom.js';

export const customContract = oc.tag('Custom').router({
  /** POST /v1/custom/analysis/users */
  createAnalysis: oc
    .route({ method: 'POST', path: '/custom/analysis/users' })
    .input(CustomQueryUsersInputSchema)
    .output(CustomUploadResponseSchema),

  /** POST /v1/custom/analysis/users/:id */
  updateAnalysis: oc
    .route({ method: 'POST', path: '/custom/analysis/users/{id}' })
    .input(z.object({ id: PositiveIdSchema, data: CustomQueryUsersInputSchema }))
    .output(CustomUploadResponseSchema),

  /** POST /v1/custom/analysis/users/:id/delete */
  deleteAnalysis: oc
    .route({ method: 'POST', path: '/custom/analysis/users/{id}/delete' })
    .input(z.object({ id: PositiveIdSchema }))
    .output(SuccessResponseSchema),

  /** POST /v1/custom/analysis/users/:id/share */
  shareAnalysis: oc
    .route({ method: 'POST', path: '/custom/analysis/users/{id}/share' })
    .input(z.object({ id: PositiveIdSchema, data: CustomShareInputSchema }))
    .output(SuccessResponseSchema),

  /** GET /v1/custom/analysis/users */
  listMyAnalyses: oc
    .route({ method: 'GET', path: '/custom/analysis/users' })
    .input(CustomQueryUsersOrderInputSchema)
    .output(CustomQueryUsersListSchema),

  /** GET /v1/custom/analysis/users/public */
  listPublicAnalyses: oc
    .route({ method: 'GET', path: '/custom/analysis/users/public' })
    .input(CustomQueryUsersOrderInputSchema)
    .output(CustomQueryUsersListSchema),

  /** GET /v1/custom/analysis/users/:id */
  getAnalysis: oc
    .route({ method: 'GET', path: '/custom/analysis/users/{id}' })
    .input(z.object({ id: PositiveIdSchema }))
    .output(ApiAnalysisUserSchema),

  /** GET /v1/external/users/:username */
  externalUser: oc
    .route({ method: 'GET', path: '/external/users/{username}' })
    .input(z.object({ username: z.string() }))
    .output(GithubUserSchema),

  /** GET /v1/external/github/users/id/:id */
  externalGithubById: oc
    .route({ method: 'GET', path: '/external/github/users/id/{id}' })
    .input(z.object({ id: z.string() }))
    .output(GithubUserSchema),

  /** GET /v1/external/github/users/username/:username */
  externalGithubByUsername: oc
    .route({ method: 'GET', path: '/external/github/users/username/{username}' })
    .input(z.object({ username: z.string() }))
    .output(GithubUserSchema),

  /** GET /v1/event/users/:x */
  eventUsers: oc
    .route({ method: 'GET', path: '/event/users/{x}' })
    .input(z.object({ x: z.string() }))
    .output(z.record(z.string(), z.unknown())),
});

export type CustomContract = typeof customContract;

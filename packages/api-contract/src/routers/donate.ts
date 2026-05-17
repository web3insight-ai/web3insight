import { oc } from '@orpc/contract';
import { z } from 'zod';
import { PositiveIdSchema, SuccessResponseSchema } from '../schemas/shared.js';
import {
  DonateRepoSchema,
  DonateRepoListSchema,
  CreateDonateRepoInputSchema,
} from '../schemas/donate.js';

export const donateContract = oc.tag('Donate').router({
  /** POST /v1/donate/repos */
  createDonation: oc
    .route({ method: 'POST', path: '/donate/repos' })
    .input(CreateDonateRepoInputSchema)
    .output(DonateRepoSchema),

  /** GET /v1/donate/repos */
  listDonations: oc
    .route({ method: 'GET', path: '/donate/repos' })
    .output(DonateRepoListSchema),

  /** GET /v1/donate/repos/:id */
  getDonationById: oc
    .route({ method: 'GET', path: '/donate/repos/{id}' })
    .input(z.object({ id: PositiveIdSchema }))
    .output(DonateRepoSchema),

  /** GET /v1/donate/repos/name/:name */
  getDonationByName: oc
    .route({ method: 'GET', path: '/donate/repos/name/{name}' })
    .input(z.object({ name: z.string() }))
    .output(DonateRepoSchema),

  /** POST /v1/donate/repos/:id */
  updateDonation: oc
    .route({ method: 'POST', path: '/donate/repos/{id}' })
    .input(z.object({ id: PositiveIdSchema, data: CreateDonateRepoInputSchema.partial() }))
    .output(SuccessResponseSchema),
});

export type DonateContract = typeof donateContract;

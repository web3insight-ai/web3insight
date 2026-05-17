import { oc } from '@orpc/contract';
import { z } from 'zod';
import { EcoNameSchema } from '../schemas/shared.js';
import {
  EcoRankListSchema,
  TopRepoListSchema,
  TopActorListSchema,
  YearlyDeveloperStatListSchema,
} from '../schemas/rank.js';

export const rankContract = oc.tag('Rank').router({
  /** GET /v1/ecosystems/top */
  ecosystemsTop: oc
    .route({ method: 'GET', path: '/ecosystems/top' })
    .output(EcoRankListSchema),

  /** GET /v1/repos/top */
  reposTop: oc
    .route({ method: 'GET', path: '/repos/top' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TopRepoListSchema),

  /** GET /v1/repos/top/7d */
  reposTop7d: oc
    .route({ method: 'GET', path: '/repos/top/7d' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TopRepoListSchema),

  /** GET /v1/repos/top/dev/7d */
  reposTopByDev7d: oc
    .route({ method: 'GET', path: '/repos/top/dev/7d' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TopRepoListSchema),

  /** GET /v1/actors/top */
  actorsTop: oc
    .route({ method: 'GET', path: '/actors/top' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TopActorListSchema),

  /** GET /v1/years/rank/report */
  // Reason: legacy cache key `YearsChineseSummary` stores an arbitrary
  // blob populated by the AI summary job — not the typed
  // YearlyDeveloperStatListSchema this contract was authored against.
  // Until the summary shape is normalised, expose it raw.
  yearsRankReport: oc
    .route({ method: 'GET', path: '/years/rank/report' })
    .output(z.unknown()),
});

export type RankContract = typeof rankContract;

import { oc } from '@orpc/contract';
import { z } from 'zod';
import { EcoNameSchema } from '../schemas/shared.js';
import { ActorsScopeSchema, StatsPeriodSchema } from '../schemas/data.js';
import {
  TotalSchema,
  ActorDateListSchema,
  ActorCountryStatListSchema,
} from '../schemas/total.js';

/**
 * GET-style read-only counts for repos/actors/ecosystems.
 * All procedures correspond 1:1 with the legacy REST endpoints under /v1/.
 */
export const totalContract = oc.tag('Total').router({
  /** GET /v1/repos/total */
  repos: oc
    .route({ method: 'GET', path: '/repos/total', summary: 'Total repo count' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TotalSchema),

  /** GET /v1/actors/total */
  actors: oc
    .route({ method: 'GET', path: '/actors/total', summary: 'Total actor count' })
    .input(z.object({ eco_name: EcoNameSchema, scope: ActorsScopeSchema }))
    .output(TotalSchema),

  /** GET /v1/actors/total/new/quarter/last */
  actorsLastQuarterNew: oc
    .route({ method: 'GET', path: '/actors/total/new/quarter/last', summary: 'New actors in last quarter' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(TotalSchema),

  /** GET /v1/ecosystems/total */
  ecosystems: oc
    .route({ method: 'GET', path: '/ecosystems/total', summary: 'Total ecosystem count' })
    .output(TotalSchema),

  /** GET /v1/actors/total/date */
  actorsByDate: oc
    .route({ method: 'GET', path: '/actors/total/date', summary: 'Actor counts over last 8 periods' })
    .input(z.object({ eco_name: EcoNameSchema, period: StatsPeriodSchema }))
    .output(ActorDateListSchema),

  /** GET /v1/actors/country/rank */
  actorsByCountry: oc
    .route({ method: 'GET', path: '/actors/country/rank', summary: 'Actor counts by country' })
    .input(z.object({ eco_name: EcoNameSchema }))
    .output(ActorCountryStatListSchema),
});

export type TotalContract = typeof totalContract;

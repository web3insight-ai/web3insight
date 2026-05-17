import { z } from 'zod';

/** Mirrors `ActorsScopeType` enum in apps/api. */
export const ActorsScopeSchema = z.enum(['all', 'core']).default('all');

/** Mirrors `StatsPeriod` enum in apps/api. */
export const StatsPeriodSchema = z.enum(['week', 'month']).default('month');

/** Mirrors `ReposOrderEnum`. */
export const ReposOrderSchema = z.enum(['id', 'org']).default('id');

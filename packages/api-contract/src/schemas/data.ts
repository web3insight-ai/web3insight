import { z } from 'zod';

// Reason: legacy NestJS REST callers (dashboard) pass 'ALL'/'Core' with
// preserved casing; preprocess lower-cases before the enum check so the
// migration doesn't force a simultaneous frontend change.
const caseInsensitive = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() : v),
    z.enum(values),
  );

/** Mirrors `ActorsScopeType` enum in apps/api. */
export const ActorsScopeSchema = caseInsensitive(['all', 'core']).default(
  'all',
);

/** Mirrors `StatsPeriod` enum in apps/api. */
export const StatsPeriodSchema = caseInsensitive(['week', 'month']).default(
  'month',
);

/** Mirrors `ReposOrderEnum`. */
export const ReposOrderSchema = caseInsensitive(['id', 'org']).default('id');

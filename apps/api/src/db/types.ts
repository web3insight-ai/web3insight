import { customType } from 'drizzle-orm/pg-core';

/**
 * Postgres `bigint` (int8) surfaced as a TypeScript `string` — mirrors what
 * Kysely's `Int8` did and what node-postgres returns by default.
 *
 * # Reason: JS `number` loses precision past 2^53; using `bigint` everywhere
 * forces BigInt arithmetic across the codebase. The migration goal is parity,
 * so we keep the Kysely string-encoded representation that all service code
 * already relies on (e.g. `where(eq(t.user_id, String(uid)))`).
 */
export const int8 = customType<{
  data: string;
  driverData: string | number | bigint;
}>({
  dataType() {
    return 'bigint';
  },
  fromDriver(value) {
    if (value === null || value === undefined) {
      return value as unknown as string;
    }
    return String(value);
  },
});

/**
 * Identity-PK variant of `int8` — Postgres `bigint generated always as
 * identity`, surfaced as TS `string`. The `.$defaultFn(() => undefined)`
 * trick marks the column as insert-optional in Drizzle's type system so
 * callers don't have to pass an explicit id; the DB still generates the
 * value via IDENTITY at write time.
 */
export const int8Identity = customType<{
  data: string;
  driverData: string | number | bigint;
}>({
  dataType() {
    return 'bigint generated always as identity';
  },
  fromDriver(value) {
    if (value === null || value === undefined) {
      return value as unknown as string;
    }
    return String(value);
  },
});

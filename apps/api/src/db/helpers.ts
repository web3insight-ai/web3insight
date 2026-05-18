import { sql, type SQL } from 'drizzle-orm';
import type { DbClient } from '@/db/client';

/** Pick the first row of a Drizzle query (parity with `executeTakeFirst`). */
export async function first<T>(q: Promise<T[]>): Promise<T | undefined> {
  return (await q)[0];
}

/** Throw with a custom message if the query returns no rows. */
export async function firstOrThrow<T>(
  q: Promise<T[]>,
  msg: string,
): Promise<T> {
  const row = (await q)[0];
  if (!row) throw new Error(msg);
  return row;
}

/**
 * Verbatim raw-SQL adapter for the total/rank/years services. Translates
 * "$1..$N" placeholders into a drizzle `sql` template so parameter binding
 * survives unchanged. Returns `{ rows }` to match the prior Kysely shape.
 *
 * # Reason: the analytics SQL contains recursive CTEs, jsonb_object_keys(),
 * and window functions. Rewriting it as Drizzle query-builder calls is high
 * risk for zero readability win; keeping the SQL text verbatim is the safe
 * migration path.
 */
export function executeRaw<T = unknown>(
  db: DbClient,
  text: string,
  params: unknown[] = [],
): Promise<{ rows: T[] }> {
  const parts: SQL[] = text.split(/(\$\d+)/g).map((chunk) => {
    const m = chunk.match(/^\$(\d+)$/);
    return m ? sql`${params[Number(m[1]) - 1]}` : sql.raw(chunk);
  });
  return db.execute(sql.join(parts)) as unknown as Promise<{ rows: T[] }>;
}

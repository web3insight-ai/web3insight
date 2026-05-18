import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from '@/db/schema';

export type DbClient = NodePgDatabase<typeof schema>;

export interface CreateDbClientOptions {
  databaseUrl: string;
  /**
   * Per-Vercel-function connection cap. Defaults to 1 — every concurrent function
   * instance brings its own connection, so combined with PgBouncer at the upstream
   * we never exceed Postgres `max_connections`.
   */
  maxConnections?: number;
  idleTimeoutMillis?: number;
}

/**
 * Create a Drizzle instance backed by node-postgres. Single shared signature for
 * Hono request handlers, Vercel cron handlers, and Inngest step functions.
 */
export function createDbClient(opts: CreateDbClientOptions): DbClient {
  const pool = new Pool({
    connectionString: opts.databaseUrl,
    max: opts.maxConnections ?? 1,
    idleTimeoutMillis: opts.idleTimeoutMillis ?? 30_000,
  });
  return drizzle(pool, { schema });
}

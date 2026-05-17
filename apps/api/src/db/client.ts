import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import Cursor from 'pg-cursor';
import type { DB } from '@/app/db/dto/db.dto';

export type DbClient = Kysely<DB>;

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
 * Create a Kysely instance backed by node-postgres. Single shared signature for
 * Hono request handlers, Vercel cron handlers, and Inngest step functions.
 */
export function createDbClient(opts: CreateDbClientOptions): DbClient {
  const pool = new Pool({
    connectionString: opts.databaseUrl,
    max: opts.maxConnections ?? 1,
    idleTimeoutMillis: opts.idleTimeoutMillis ?? 30_000,
  });
  return new Kysely<DB>({
    dialect: new PostgresDialect({ cursor: Cursor, pool }),
  });
}

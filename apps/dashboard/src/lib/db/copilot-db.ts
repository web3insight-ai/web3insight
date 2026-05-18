import "server-only";

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@env";
import {
  schema,
  copilot_sessions,
  copilot_messages,
  copilot_feedback,
} from "./schema/copilot";

// Inferred row types — exported for callers that previously imported the
// hand-written Kysely interfaces of the same name.
export type CopilotSessionsTable = typeof copilot_sessions.$inferSelect;
export type CopilotMessagesTable = typeof copilot_messages.$inferSelect;
export type CopilotFeedbackTable = typeof copilot_feedback.$inferSelect;

export type CopilotDb = NodePgDatabase<typeof schema>;

// -- Singleton Drizzle instances ---------------------------------------------
// Reason: Separate read (read-only account) and write (admin account) pools
// so that AI queries use the read-only user while session persistence uses admin.

let readDb: CopilotDb | null = null;
let writeDb: CopilotDb | null = null;

function createDrizzleInstance(connectionString: string): CopilotDb {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

/**
 * Read-only database connection (uses COPILOT_DATABASE_URL).
 * Used for SELECT queries like listing sessions and loading history.
 */
export function getCopilotDb(): CopilotDb {
  if (readDb) {
    return readDb;
  }

  const connectionString = env.COPILOT_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "COPILOT_DATABASE_URL is not configured. Set it in your environment variables.",
    );
  }

  readDb = createDrizzleInstance(connectionString);
  return readDb;
}

/**
 * Read-write database connection (uses COPILOT_DATABASE_WRITE_URL).
 * Falls back to COPILOT_DATABASE_URL if write URL is not configured.
 * Used for INSERT/UPDATE/DELETE operations on sessions and messages.
 */
export function getCopilotWriteDb(): CopilotDb {
  if (writeDb) {
    return writeDb;
  }

  const connectionString =
    env.COPILOT_DATABASE_WRITE_URL ?? env.COPILOT_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "COPILOT_DATABASE_WRITE_URL (or COPILOT_DATABASE_URL) is not configured.",
    );
  }

  writeDb = createDrizzleInstance(connectionString);
  return writeDb;
}

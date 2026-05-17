import "server-only";

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { env } from "@env";

// -- Table type definitions --------------------------------------------------

interface CopilotSessionsTable {
  session_id: string; // UUID, PK
  user_id: string | null;
  title: string | null;
  last_active_at: Date;
  is_archived: boolean;
  deleted_at: Date | null;
  created_at: Date;
}

interface CopilotMessagesTable {
  message_id: string; // UUID, PK
  session_id: string; // UUID, FK -> copilot_sessions
  parent_id: string | null; // UUID, for branching
  role: "user" | "assistant";
  ui_message: unknown; // JSONB column
  created_at: Date;
}

interface CopilotFeedbackTable {
  id: string; // UUID, PK
  session_id: string; // UUID, FK -> copilot_sessions
  message_id: string; // UUID, FK -> copilot_messages
  feedback_type: "thumbs_up" | "thumbs_down";
  comment: string | null;
  created_at: Date;
}

export interface CopilotDatabase {
  "api.copilot_sessions": CopilotSessionsTable;
  "api.copilot_messages": CopilotMessagesTable;
  "api.copilot_feedback": CopilotFeedbackTable;
}

export type {
  CopilotSessionsTable,
  CopilotMessagesTable,
  CopilotFeedbackTable,
};

// -- Singleton Kysely instances ----------------------------------------------
// Reason: Separate read (read-only account) and write (admin account) pools
// so that AI queries use the read-only user while session persistence uses admin.

let readDb: Kysely<CopilotDatabase> | null = null;
let writeDb: Kysely<CopilotDatabase> | null = null;

function createKyselyInstance(
  connectionString: string,
): Kysely<CopilotDatabase> {
  const dialect = new PostgresDialect({
    pool: new Pool({ connectionString }),
  });
  return new Kysely<CopilotDatabase>({ dialect });
}

/**
 * Read-only database connection (uses COPILOT_DATABASE_URL).
 * Used for SELECT queries like listing sessions and loading history.
 */
export function getCopilotDb(): Kysely<CopilotDatabase> {
  if (readDb) {
    return readDb;
  }

  const connectionString = env.COPILOT_DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "COPILOT_DATABASE_URL is not configured. Set it in your environment variables.",
    );
  }

  readDb = createKyselyInstance(connectionString);
  return readDb;
}

/**
 * Read-write database connection (uses COPILOT_DATABASE_WRITE_URL).
 * Falls back to COPILOT_DATABASE_URL if write URL is not configured.
 * Used for INSERT/UPDATE/DELETE operations on sessions and messages.
 */
export function getCopilotWriteDb(): Kysely<CopilotDatabase> {
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

  writeDb = createKyselyInstance(connectionString);
  return writeDb;
}

import "server-only";

import { sql } from "kysely";
import { getCopilotDb } from "./copilot-db";

let dbAvailable: boolean | null = null;

/**
 * Checks if copilot tables are available in the database.
 * Returns true if tables exist and are accessible, false otherwise.
 * Reason: The DB account may be read-only, so we check instead of create.
 */
export async function isCopilotDbReady(): Promise<boolean> {
  if (dbAvailable !== null) {
    return dbAvailable;
  }

  try {
    const db = getCopilotDb();

    const result = await sql<{ exists: boolean }>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'api'
          AND table_name = 'copilot_sessions'
      ) as exists
    `.execute(db);

    dbAvailable = result.rows[0]?.exists === true;

    if (!dbAvailable) {
      console.warn(
        "[Copilot] Database tables not found. Session persistence is disabled.\n" +
          "To enable, run the SQL from copilot-init.ts COPILOT_TABLES_SQL as a DB admin.",
      );
    }

    return dbAvailable;
  } catch {
    dbAvailable = false;
    console.warn(
      "[Copilot] Database connection failed. Session persistence is disabled.",
    );
    return false;
  }
}

/**
 * Legacy wrapper for backwards compatibility. Does not throw.
 */
export async function ensureCopilotTables(): Promise<void> {
  await isCopilotDbReady();
}

/**
 * SQL to create copilot tables manually.
 * Run this as a database admin if the app account lacks CREATE TABLE permission.
 */
export const COPILOT_TABLES_SQL = `
-- Copilot tables in api schema (consistent with other web3insight tables)
-- Reason: AI SDK generates nanoid-style message IDs (not UUIDs), so TEXT is used.
-- See: web3insight-api/migrations/20260227120000_copilot.sql
CREATE TABLE IF NOT EXISTS "api"."copilot_sessions" (
  "session_id"     TEXT PRIMARY KEY,
  "user_id"        VARCHAR(255),
  "title"          TEXT,
  "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "is_archived"    BOOLEAN NOT NULL DEFAULT FALSE,
  "deleted_at"     TIMESTAMP WITH TIME ZONE,
  "created_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_messages" (
  "message_id" TEXT PRIMARY KEY,
  "session_id" TEXT NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
  "parent_id"  TEXT,
  "role"       VARCHAR(20) NOT NULL,
  "ui_message" JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_feedback" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "session_id"    TEXT NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
  "message_id"    TEXT NOT NULL REFERENCES "api"."copilot_messages" ("message_id"),
  "feedback_type" VARCHAR(20) NOT NULL,
  "comment"       TEXT,
  "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_sessions_user ON "api"."copilot_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_active ON "api"."copilot_sessions" ("last_active_at" DESC);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_session ON "api"."copilot_messages" ("session_id");
CREATE INDEX IF NOT EXISTS idx_copilot_feedback_message ON "api"."copilot_feedback" ("message_id");

-- Grant permissions to the app user
GRANT SELECT, INSERT, UPDATE, DELETE ON "api"."copilot_sessions" TO web3_report;
GRANT SELECT, INSERT, UPDATE, DELETE ON "api"."copilot_messages" TO web3_report;
GRANT SELECT, INSERT, UPDATE, DELETE ON "api"."copilot_feedback" TO web3_report;
`;

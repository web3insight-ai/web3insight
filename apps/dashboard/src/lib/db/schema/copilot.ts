import {
  pgSchema,
  text,
  varchar,
  jsonb,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Copilot session storage lives in the same `api` schema as the rest of the
// Web3Insight backend (see ../copilot-init.ts COPILOT_TABLES_SQL for the DDL
// run as DB admin).

export const apiSchema = pgSchema("api");

export const copilot_sessions = apiSchema.table("copilot_sessions", {
  session_id: text("session_id").primaryKey(),
  user_id: varchar("user_id", { length: 255 }),
  title: text("title"),
  last_active_at: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  is_archived: boolean("is_archived").notNull().default(false),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
  // Reason: Controls who can read the thread. 'private' is owner-only;
  // 'public' allows anonymous reads via the /copilot/share/[sessionId] page.
  access_level: varchar("access_level", { length: 16 })
    .notNull()
    .default("private"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const copilot_messages = apiSchema.table("copilot_messages", {
  message_id: text("message_id").primaryKey(),
  session_id: text("session_id")
    .notNull()
    .references(() => copilot_sessions.session_id),
  parent_id: text("parent_id"),
  role: varchar("role", { length: 20 }).notNull(),
  ui_message: jsonb("ui_message").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const copilot_feedback = apiSchema.table("copilot_feedback", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::TEXT`),
  session_id: text("session_id")
    .notNull()
    .references(() => copilot_sessions.session_id),
  message_id: text("message_id")
    .notNull()
    .references(() => copilot_messages.message_id),
  feedback_type: varchar("feedback_type", { length: 20 }).notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

// Reason: Personal access tokens that let third-party MCP clients call
// /api/ai/mcp on the user's behalf. Plaintext token is hashed via HMAC-SHA256
// using AUTH_SECRET; only the prefix is kept for display in the UI.
export const copilot_mcp_tokens = apiSchema.table("copilot_mcp_tokens", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::TEXT`),
  user_id: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 80 }).notNull(),
  token_hash: varchar("token_hash", { length: 128 }).notNull().unique(),
  token_preview: varchar("token_preview", { length: 32 }).notNull(),
  last_used_at: timestamp("last_used_at", { withTimezone: true }),
  revoked_at: timestamp("revoked_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const schema = {
  copilot_sessions,
  copilot_messages,
  copilot_feedback,
  copilot_mcp_tokens,
};

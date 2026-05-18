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

export const schema = {
  copilot_sessions,
  copilot_messages,
  copilot_feedback,
};

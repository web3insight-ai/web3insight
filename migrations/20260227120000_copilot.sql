-- Reason: AI SDK generates nanoid-style message IDs (not UUIDs),
-- so message_id and parent_id must be TEXT instead of UUID.

CREATE TABLE IF NOT EXISTS "api"."copilot_sessions"
(
    "session_id"     TEXT PRIMARY KEY,
    "user_id"        VARCHAR(255),
    "title"          TEXT,
    "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "is_archived"    BOOLEAN                  NOT NULL DEFAULT FALSE,
    "deleted_at"     TIMESTAMP WITH TIME ZONE,
    "created_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_messages"
(
    "message_id" TEXT PRIMARY KEY,
    "session_id" TEXT NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
    "parent_id"  TEXT,
    "role"       VARCHAR(20)              NOT NULL,
    "ui_message" JSONB                    NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_feedback"
(
    "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "session_id"    TEXT NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
    "message_id"    TEXT NOT NULL REFERENCES "api"."copilot_messages" ("message_id"),
    "feedback_type" VARCHAR(20)              NOT NULL,
    "comment"       TEXT,
    "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_sessions_user
    ON "api"."copilot_sessions" ("user_id");

CREATE INDEX IF NOT EXISTS idx_copilot_sessions_active
    ON "api"."copilot_sessions" ("last_active_at" DESC);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_session
    ON "api"."copilot_messages" ("session_id");

CREATE INDEX IF NOT EXISTS idx_copilot_feedback_message
    ON "api"."copilot_feedback" ("message_id");

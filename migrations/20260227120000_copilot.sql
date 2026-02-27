CREATE TABLE IF NOT EXISTS "api"."copilot_sessions"
(
    "session_id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"        VARCHAR(255),
    "title"          TEXT,
    "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "is_archived"    BOOLEAN                  NOT NULL DEFAULT FALSE,
    "deleted_at"     TIMESTAMP WITH TIME ZONE,
    "created_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_messages"
(
    "message_id" UUID PRIMARY KEY,
    "session_id" UUID NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
    "parent_id"  UUID,
    "role"       VARCHAR(20)              NOT NULL,
    "ui_message" JSONB                    NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."copilot_feedback"
(
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_id"    UUID NOT NULL REFERENCES "api"."copilot_sessions" ("session_id"),
    "message_id"    UUID NOT NULL REFERENCES "api"."copilot_messages" ("message_id"),
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

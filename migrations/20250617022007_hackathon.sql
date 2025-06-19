CREATE TABLE IF NOT EXISTS "api"."analysis_users"
(
    "id"              BIGSERIAL,
    "intent"          TEXT                     NOT NULL DEFAULT 'hackathon',
    "request_data"    JSONB                    NOT NULL DEFAULT '{}',
    "github"          JSONB                    NOT NULL DEFAULT '{}',
    "submitter_id"    TEXT                     NOT NULL DEFAULT '',
    "data"            JSONB                    NOT NULL DEFAULT '{}',
    "created_at"      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at"      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
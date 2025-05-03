-- Add migration script here
CREATE TABLE "analysis"."github_personal"
(
    "id"          BIGINT PRIMARY KEY       NOT NULL DEFAULT 0,
    "login"       TEXT                     NOT NULL DEFAULT '',
    "data"        JSONB                    NOT NULL DEFAULT '{}',
    "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-01-01T00:00:00Z'
);

CREATE TABLE "analysis"."eco_event"
(
    "id"          BIGSERIAL PRIMARY KEY,
    "eco"         TEXT                     NOT NULL DEFAULT '',
    "uid"         BIGINT                   NOT NULL DEFAULT 0,
    "total_count" INTEGER                  NOT NULL DEFAULT 0,
    "push_count"  INTEGER                  NOT NULL DEFAULT 0,
    "pr_count"    INTEGER                  NOT NULL DEFAULT 0,
    "start_time"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-01-01T00:00:00Z',
    "end_time"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-01-01T00:00:00Z',
    "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2011-01-01T00:00:00Z'
)
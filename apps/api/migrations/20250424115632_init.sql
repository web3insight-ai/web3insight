CREATE SCHEMA IF NOT EXISTS api;

CREATE TABLE IF NOT EXISTS "api"."configs"
(
    "id"        BIGSERIAL PRIMARY KEY,
    "name"      TEXT    NOT NULL,
    "body"      TEXT    NOT NULL DEFAULT '',
    "available" BOOLEAN NOT NULL DEFAULT false
);


CREATE TABLE IF NOT EXISTS "api"."upstream_repos"
(
    "upstream_repo_name" TEXT PRIMARY KEY,
    "repo_id"            BIGINT UNIQUE,
    "api"                JSONB                             DEFAULT '{}',
    "upstream_marks"     JSONB                    NOT NULL DEFAULT '{}',
    "abnormal"           BOOLEAN                  NOT NULL DEFAULT false,
    "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    "api_updated_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE SCHEMA IF NOT EXISTS data;

CREATE TABLE IF NOT EXISTS "data"."repos"
(
    "repo_id"            BIGINT PRIMARY KEY       NOT NULL,
    "upstream_repo_name" TEXT                     NOT NULL,
    "repo_name"          TEXT                     NOT NULL,
    "upstream_marks"     JSONB                    NOT NULL DEFAULT '{}',
    "custom_marks"       JSONB                    NOT NULL DEFAULT '{}',
    "indexed"            BOOLEAN                  NOT NULL DEFAULT false,
    "created_at"         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "api_updated_at"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "event_updated_at"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
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

CREATE TABLE "api"."caches"
(
    "cache_key"  TEXT                     NOT NULL,
    "cache_data" JSONB DEFAULT '{}'::JSONB,
    "eco_name"   TEXT  DEFAULT 'ALL'      NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("cache_key", "eco_name")
);
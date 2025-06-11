-- Add migration script here
CREATE SCHEMA IF NOT EXISTS "web3";

CREATE EXTENSION pg_mooncake;

CREATE TABLE "web3"."events"
(
    "id"          BIGINT                   NOT NULL,
    "actor_id"    BIGINT                   NOT NULL,
    "actor_login" TEXT                     NOT NULL,
    "repo_id"     BIGINT,
    "repo_name"   TEXT,
    "org_id"      BIGINT,
    "org_login"   TEXT,
    "event_type"  TEXT                     NOT NULL,
    "payload"     JSON                     NOT NULL DEFAULT '{}',
    "body"        TEXT,
    "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("id", "created_at")
);

CALL mooncake.create_table('events_iceberg', 'events');
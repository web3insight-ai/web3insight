CREATE SCHEMA IF NOT EXISTS api;

CREATE TABLE IF NOT EXISTS "api"."configs"
(
    "id"        BIGSERIAL PRIMARY KEY,
    "name"      TEXT    NOT NULL,
    "body"      TEXT    NOT NULL DEFAULT '',
    "available" BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS "api"."auth_users"
(
    user_id        BIGSERIAL PRIMARY KEY,
    user_nick_name TEXT                     NOT NULL DEFAULT '',
    user_avatar    TEXT                     NOT NULL DEFAULT '',
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."auth_users_binds"
(
    bind_id     BIGSERIAL PRIMARY KEY,
    bind_type   TEXT                     NOT NULL DEFAULT 'github',
    bind_key    TEXT                     NOT NULL DEFAULT '',
    bind_secret TEXT                     NOT NULL DEFAULT '',
    bind_uid    BIGINT                   NOT NULL,
    bind_openid TEXT                     NOT NULL DEFAULT '',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)

CREATE TABLE IF NOT EXISTS "api"."auth_user_roles"
(
    user_role_id   BIGSERIAL PRIMARY KEY,
    user_role_uid  BIGINT                   NOT NULL,
    user_role_name TEXT                     NOT NULL DEFAULT '',
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "api"."auth_magic"
(
    id         BIGSERIAL PRIMARY KEY,
    type       TEXT                     NOT NULL DEFAULT 'login',
    magic      TEXT                     NOT NULL,
    uid        BIGINT                   NOT NULL,
    status     INTEGER                  NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
)
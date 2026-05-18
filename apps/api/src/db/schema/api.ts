import {
  pgSchema,
  text,
  jsonb,
  timestamp,
  boolean,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { int8, int8Identity } from '@/db/types';

// All tables in the Postgres `api` schema. Mirrors apps/api/src/app/db/dto/db.dto.ts
// (Kysely-codegen output) field-by-field — JS field names match column names
// (snake_case) so service code keeps working unchanged.

export const apiSchema = pgSchema('api');

export const api_caches = apiSchema.table('caches', {
  cache_key: text('cache_key').notNull(),
  eco_name: text('eco_name').notNull().default('ALL'),
  cache_data: jsonb('cache_data'),
  created_at: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
});

export const api_configs = apiSchema.table('configs', {
  available: boolean('available').notNull().default(true),
  body: text('body').notNull(),
  id: int8Identity('id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  name: text('name').notNull(),
});

export const api_analysis_users = apiSchema.table('analysis_users', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  data: jsonb('data')
    .notNull()
    .default(sql`'{}'::jsonb`),
  github: jsonb('github')
    .notNull()
    .default(sql`'{}'::jsonb`),
  ai: jsonb('ai')
    .notNull()
    .default(sql`'{}'::jsonb`),
  id: int8Identity('id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  public: boolean('public').notNull().default(false),
  intent: text('intent').notNull().default(''),
  request_data: jsonb('request_data')
    .notNull()
    .default(sql`'{}'::jsonb`),
  submitter_id: int8('submitter_id')
    .notNull()
    .default(sql`0`),
  description: text('description').notNull().default(''),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
});

export const api_upstream_repos = apiSchema.table('upstream_repos', {
  abnormal: boolean('abnormal').notNull().default(false),
  api: jsonb('api'),
  api_updated_at: timestamp('api_updated_at', {
    withTimezone: true,
    mode: 'string',
  }),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  repo_id: int8('repo_id'),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  upstream_marks: jsonb('upstream_marks')
    .notNull()
    .default(sql`'{}'::jsonb`),
  upstream_repo_name: text('upstream_repo_name').notNull(),
});

export const api_auth_users = apiSchema.table('auth_users', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  user_avatar: text('user_avatar').notNull().default(''),
  user_id: int8Identity('user_id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  user_nick_name: text('user_nick_name').notNull().default(''),
  user_bio: text('user_bio').notNull().default(''),
  user_custom_x: text('user_custom_x').notNull().default(''),
  user_custom_labels: jsonb('user_custom_labels')
    .notNull()
    .default(sql`'[]'::jsonb`),
  user_title: text('user_title').notNull().default(''),
  mark: jsonb('mark')
    .notNull()
    .default(sql`'{}'::jsonb`),
});

export const api_auth_users_binds = apiSchema.table('auth_users_binds', {
  bind_id: int8Identity('bind_id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  bind_key: text('bind_key').notNull().default(''),
  bind_openid: text('bind_openid').notNull().default(''),
  bind_secret: text('bind_secret').notNull().default(''),
  bind_type: text('bind_type').notNull().default(''),
  bind_uid: int8('bind_uid').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
});

export const api_auth_users_roles = apiSchema.table('auth_users_roles', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  user_role_id: int8Identity('user_role_id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  user_role_name: text('user_role_name').notNull().default(''),
  user_role_uid: int8('user_role_uid').notNull(),
});

export const api_auth_magic = apiSchema.table('auth_magic', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  id: int8Identity('id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  magic: text('magic').notNull(),
  status: integer('status').notNull().default(0),
  type: text('type').notNull().default(''),
  uid: int8('uid').notNull(),
});

export const api_donate_repos = apiSchema.table('donate_repos', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  repo_donate_data: jsonb('repo_donate_data')
    .notNull()
    .default(sql`'{}'::jsonb`),
  repo_id: int8('repo_id').notNull(),
  repo_info: jsonb('repo_info')
    .notNull()
    .default(sql`'{}'::jsonb`),
  submitter_id: int8('submitter_id')
    .notNull()
    .default(sql`0`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
});

export const api_auth_users_info = apiSchema.table('auth_users_info', {
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  user_avatar: text('user_avatar').notNull().default(''),
  user_bio: text('user_bio').notNull().default(''),
  user_custom_labels: jsonb('user_custom_labels')
    .notNull()
    .default(sql`'[]'::jsonb`),
  user_custom_x: text('user_custom_x').notNull().default(''),
  user_id: int8('user_id'),
  user_info_type: text('user_info_type').notNull().default(''),
  user_nick_name: text('user_nick_name').notNull().default(''),
  user_title: text('user_title').notNull().default(''),
  mark: jsonb('mark')
    .notNull()
    .default(sql`'{}'::jsonb`),
  user_extra: jsonb('user_extra')
    .notNull()
    .default(sql`'{}'::jsonb`),
});

export const api_users_invite = apiSchema.table('users_invite', {
  created_at: int8('created_at'),
  id: int8Identity('id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  invite_source_id: numeric('invite_source_id').notNull(),
  invite_source_type: text('invite_source_type').notNull(),
  invite_source_uid: numeric('invite_source_uid').notNull(),
  invite_uid: numeric('invite_uid').notNull(),
  mark: jsonb('mark')
    .notNull()
    .default(sql`'{}'::jsonb`),
  updated_at: int8('updated_at'),
});

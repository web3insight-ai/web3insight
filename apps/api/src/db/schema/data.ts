import {
  pgSchema,
  text,
  jsonb,
  timestamp,
  boolean,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { int8, int8Identity } from '@/db/types';

// All tables in the Postgres `data` schema. Field names are snake_case to
// match the existing service code (and the column names themselves) verbatim.
// Timestamp columns are mode: 'string' so callsites can keep passing
// `new Date().toISOString()` without per-column wrapping.

export const dataSchema = pgSchema('data');

export const data_actors = dataSchema.table('actors', {
  actor_id: int8('actor_id').notNull(),
  actor_login: text('actor_login'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  api: jsonb('api')
    .notNull()
    .default(sql`'{}'::jsonb`),
  abnormal: boolean('abnormal'),
  city: text('city').notNull().default(''),
  country: text('country').notNull().default(''),
  eco_score: jsonb('eco_score')
    .notNull()
    .default(sql`'{}'::jsonb`),
});

export const data_events = dataSchema.table('events', {
  actor_id: int8('actor_id').notNull(),
  actor_login: text('actor_login').notNull(),
  body: text('body'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  event_type: text('event_type').notNull(),
  id: int8('id').notNull(),
  org_id: int8('org_id'),
  org_login: text('org_login'),
  payload: jsonb('payload')
    .notNull()
    .default(sql`'{}'::jsonb`),
  public: boolean('public'),
  repo_id: int8('repo_id'),
  repo_name: text('repo_name'),
});

export const data_repos = dataSchema.table('repos', {
  active_developers: jsonb('active_developers')
    .notNull()
    .default(sql`'[]'::jsonb`),
  api: jsonb('api'),
  api_updated_at: timestamp('api_updated_at', {
    withTimezone: true,
    mode: 'string',
  }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  custom_marks: jsonb('custom_marks')
    .notNull()
    .default(sql`'{}'::jsonb`),
  indexed: boolean('indexed').notNull().default(false),
  repo_id: int8('repo_id').notNull(),
  repo_name: text('repo_name').notNull(),
  star_history: jsonb('star_history')
    .notNull()
    .default(sql`'{}'::jsonb`),
  upstream_marks: jsonb('upstream_marks')
    .notNull()
    .default(sql`'{}'::jsonb`),
});

export const data_ecosystems = dataSchema.table('ecosystems', {
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  description: text('description').notNull().default(''),
  icon: text('icon').notNull().default(''),
  id: int8Identity('id')
    .notNull()
    .$defaultFn(() => undefined as unknown as string),
  name: text('name').notNull(),
  score: doublePrecision('score').notNull().default(0),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .default(sql`now()`),
  kind: text('kind').notNull().default(''),
});

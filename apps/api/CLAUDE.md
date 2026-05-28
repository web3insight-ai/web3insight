## API App Guide

Scope: `apps/api/**`. Inherit the root guide; this file covers API, SQL, Drizzle, and Vercel Function rules.

## Surface

- Package: `@web3insight/api`
- Stack: Hono + oRPC + Zod contracts, Drizzle, PostgreSQL, Inngest, Vercel Build Output API.
- Local: `cd apps/api && vercel dev` on port `3010`.
- Production: Vercel project `web3insight-api`, domain `https://api.web3insight.ai`.

## Commands

```bash
pnpm --filter @web3insight/api lint
pnpm --filter @web3insight/api typecheck
pnpm --filter @web3insight/api test
pnpm --filter @web3insight/api build
pnpm --filter @web3insight/api db:check
```

Contract changes usually also need:

```bash
pnpm --filter @web3insight/api-contract typecheck
pnpm --filter @web3insight/orpc-client typecheck
```

## Code Map

```text
src/app/create-app.ts          # Hono app factory and middleware/RPC mounting
src/app/container.ts           # lazy service container and shared Postgres pool
src/serverless/api-hono.ts     # Vercel Node -> Web Request adapter
src/serverless/cron-*.ts       # Vercel cron entries
src/rpc-hono/handlers/*.ts     # oRPC handler implementations
src/services/*.ts              # pure business services
src/db/schema/{api,data}.ts    # Drizzle schema definitions
src/db/helpers.ts              # first, firstOrThrow, executeRaw
src/inngest/functions/*.ts     # long-running sync workflows
```

## Change Order

1. Update `packages/api-contract/src/routers/<router>.ts` Zod schema/procedure first.
2. Update or add a pure service method in `src/services/*`.
3. Wire handler logic in `src/rpc-hono/handlers/*`; handlers only adapt input/context/return shape.
4. Update frontend typed-client call sites and run affected package checks.

Do not add Express/serverful entrypoints. The API deploys through `scripts/bundle-functions.ts` into `.vercel/output/functions/*`.

## Debugging

- Online failures: Vercel deployment status → build logs → runtime logs → function error → env scope.
- oRPC failures: confirm `/rpc/*` path, input schema, Bearer/cookie auth, then handler/service path.
- Sync failures: inspect Inngest event name, step retry, cron trigger, and `src/inngest/functions/*` before editing code.
- Database debugging defaults to read-only: `SELECT`, `EXPLAIN`, schema introspection. Ask before writes, DDL, migrations, backfills, or job replays.

## Data Schema Rules

- `data.events` is GHArchive-scale and 10B+ rows. Filter early, avoid unbounded scans, prefer CTEs for complex analytics.
- `data.repos.upstream_marks` is JSONB; first-level keys are ecosystems.
- Need repo display names through `repo_id -> data.repos`.
- Need actor display names through `actor_id -> data.actors`.
- Multi-ecosystem SQL must start with:

```sql
WITH ecosystem_list AS (SELECT UNNEST($1::text[]) AS ecosystem_name)
```

Large analytics SQL with recursive CTEs, windows, or JSONB functions may stay as raw SQL through `executeRaw(this.db, sql, params)`.

## Drizzle Rules

- Use Drizzle builder for `api.*` business queries.
- Import table objects from `@/db/schema`; keep JS names snake_case.
- Pass JS objects directly into JSONB writes; do not `JSON.stringify` first.
- JSONB key exists: `` sql`jsonb_exists(${col}, ${name})` ``.
- JSONB contains: `` sql`${col} @> ${value}::jsonb` ``.
- Schema source of truth is production Postgres. Use `pnpm db:pull`, then manually merge into `src/db/schema/api.ts` / `data.ts`.

## Response Style

For SQL/analytics work, reply in Simplified Chinese, explain what was done in numbered execution order, and output complete readable SQL without abbreviation.

## Docs

- Hono: https://hono.dev/llms-full.txt
- oRPC: https://orpc.unnoq.com/llms-full.txt
- Drizzle ORM: https://orm.drizzle.team/llms-full.txt

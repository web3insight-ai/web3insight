# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Project Overview

**Web3Insight** is a Web3 developer analytics platform organized as a Turborepo + pnpm monorepo. Single GitHub repo: `web3insight-ai/web3insight`.

| Package | Path | Stack | Default port | Deploy target |
|---|---|---|---|---|
| `@web3insight/api` | `apps/api` | Hono + Kysely + PostgreSQL (NestJS legacy on `api/index.ts` for /v1/auth/*) | 3010 | Vercel (HTTP + Cron + Inngest) |
| `@web3insight/dashboard` | `apps/dashboard` | Next.js 16 + Turbopack | 3000 | Vercel |
| `@web3insight/web` | `apps/web` | Next.js 16 + oRPC | 3001 | Vercel |
| `@web3insight/dev-card` | `apps/dev-card` | Next.js 16 + Privy + oRPC | 3002 | Vercel |

Data sources: GitHub API, OSS Insight, RSS3, Privy.

### Shared packages (`packages/*`)

| Package | Purpose |
|---|---|
| `@web3insight/api-contract` | Single source of truth for all RPC contracts — Zod schemas + oRPC procedure signatures (8 sub-routers: total/rank/repo/auth/admin/custom/donate/github) |
| `@web3insight/orpc-client` | Typed RPC client factory (`createWeb3InsightClient`) + TanStack Query integration |
| `@web3insight/env-base` | Shared `@t3-oss/env-nextjs` schema fragments (DATA_API_URL, DATA_API_TOKEN, HTTP_TIMEOUT) |
| `@web3insight/query-keys` | TanStack Query key factory + STATS/USER cache option presets |
| `@web3insight/auth-privy` | Shared Privy provider + `usePrivyAuthSync` JWT-exchange hook |

### Config packages (`config/*`)

| Package | Purpose |
|---|---|
| `@web3insight/typescript-config` | `base.json` / `nextjs.json` / `node.json` / `library.json` tsconfig presets |
| `@web3insight/eslint-config` | `base.mjs` / `nextjs.mjs` / `node.mjs` flat configs |
| `@web3insight/next-config` | `createNextConfig(opts)` factory — standalone output + outputFileTracingRoot + shared transpilePackages |
| `@web3insight/tailwind-config` | Tailwind v4 preset + PostCSS config + globals.css |

### Data flow

```
dashboard ──┐
            │
web ────────┼──▶ api (NestJS) ──▶ PostgreSQL
            │           │
dev-card ───┘           ├──▶ GitHub API
                        ├──▶ OpenAI / OpenRouter
                        └──▶ Privy
```

The 3 frontends call `api` via **three coexisting Vercel functions**:
1. **Hono `api/hono.ts`** — primary runtime, mounts `/rpc/*` (34 of 47 procedures) + `/v1/*` + `/v2/*` for all non-auth endpoints. Pure-class services in `src/services/`, lazy container in `src/app/container.ts`, oRPC handlers in `src/rpc-hono/handlers/`.
2. **NestJS `api/index.ts` (legacy)** — still handles `/v1/auth/*`, `/v1/user/*`, `/v1/login/*`, `/v1/magic`, `/v1/bind/*`, `/v1/privy/*`, `/v1/openbuild/*`, `/v1/ai/*`, `/rpc/auth/*`, and `/doc/api`. Will be deleted once `auth.service.ts` (1967 LOC) is fully ported and `ai.controller.ts` streaming moves to Hono.
3. **Inngest `api/inngest/[...slug].ts`** — durable background runtime for 11 long-running sync jobs migrated off `nestjs-console`. Triggered by Vercel Cron (`api/cron/*.ts`) or by `inngest.send({ name: 'sync/...' })`.

vercel.json rewrites pick the right function per path. Both Hono and NestJS share the same Postgres pool config (PgBouncer pooled URL via `DATABASE_URL`); both verify JWTs signed by NestJS AuthService.

## Essential commands

```bash
# Install everything (root, single shared lockfile)
pnpm install

# Dev — start all 4 apps in parallel
pnpm dev

# Dev — individual app
pnpm dev:dashboard          # port 3000
pnpm dev:web                # port 3001
pnpm dev:dev-card           # port 3002
pnpm dev:api                # port 3010

# Build everything
pnpm build

# Lint / typecheck / test (all turbo-cached)
pnpm lint
pnpm typecheck
pnpm test

# NestJS console commands (sync jobs, cache clear, etc.)
pnpm console:dev sync:rank
pnpm console:prod cache:clear

# Dependency hygiene
pnpm syncpack:lint            # check version consistency
pnpm syncpack:fix             # auto-fix mismatches
```

## Workspace conventions

- **Internal deps**: `workspace:*`. Run `pnpm syncpack:lint` to enforce.
- **External deps**: prefer `catalog:` (defined in `pnpm-workspace.yaml`) for shared versions. App-local versions OK for unique deps.
- **Node**: `>= 22.0.0` (see `.nvmrc`).
- **pnpm**: pinned to `10.29.3` via root `package.json` `packageManager`.
- **TypeScript**: 6.0.3 across all packages (`catalog:typescript`).

## Deployment

### Vercel — 4 projects

Each app has its own Vercel project, all pointing to the same Git repo with different Root Directories:

| Project | Root | Production branch | Preview alias |
|---|---|---|---|
| `web3insight-dashboard` | `apps/dashboard` | `master` | `dev` → `dev.web3insight.ai` |
| `web3insight-web` | `apps/web` | `master` | `dev` |
| `web3insight-dev-card` | `apps/dev-card` | `master` | `dev` |
| `web3insight-api` | `apps/api` | `master` | `dev` |

The `api` app uses `@vendia/serverless-express` to wrap NestJS into a Vercel Function. See `apps/api/api/index.ts` and `apps/api/vercel.json`.

**Each Vercel project requires env vars set in both `production` and `preview` scopes.** See `apps/<name>/.env.example` for the variable list per app.

### Railway / Zeabur — console workers

As of the Hono rewrite, the 16 NestJS console commands are migrated to **Vercel Cron + Inngest** — no more Railway/Zeabur Docker workers required for sync jobs:

- 5 short tasks → `apps/api/api/cron/*.ts` (cache-clear, sync-rank-incremental, sync-eco-total, eco-print, sync-years). Scheduled via `vercel.json` `crons` block.
- 11 long-running tasks → `apps/api/src/inngest/functions/*.ts`, fired from cron handlers via `inngest.send()` so step-checkpointed work survives Vercel function timeouts.

The legacy `apps/api/Dockerfile` is retained as a fallback only; Railway services can be archived once Phase F service extraction (TODO comments in `inngest/functions/`) is complete and Inngest cloud functions are verified for the largest sync jobs.

## oRPC contract-first migration

Migration is **gradual** — REST controllers in `apps/api/src/api/controller/` and oRPC handlers in `apps/api/src/rpc/handlers/` coexist. Each endpoint is migrated 1-by-1.

### Migration status (Hono runtime — `apps/api/src/rpc-hono/handlers/`)

| Sub-contract | Status | Handler |
|---|---|---|
| `total` (6 procedures) | ✅ Full | `handlers/total.ts` (via `container.services.cache`) |
| `donate` (5 procedures) | ✅ Full | `handlers/donate.ts` |
| `github` (1 procedure) | ✅ Full | `handlers/github.ts` |
| `repo` (1 procedure) | ✅ Full | `handlers/repo.ts` |
| `rank` (6 procedures) | ✅ Full | `handlers/rank.ts` |
| `admin` (4 procedures) | ✅ Full | `handlers/admin.ts` (auth-protected) |
| `custom` (11 procedures) | ✅ Full | `handlers/custom.ts` |
| `auth` (13 procedures) | 🚧 Stub | `handlers/auth.ts` — pending Phase D port of `auth/services/auth.services.ts` (1967 LOC) |

**34 of 47 procedures live on Hono**; clients still using NestJS `/v1/auth/*` until Phase D completes the AuthService port.

### How to migrate one controller from REST → Hono oRPC

1. Confirm contract exists in `packages/api-contract/src/routers/<name>.ts`. If not, define using `oc.tag('X').router({ ... })`.
2. Confirm the underlying business logic lives in `apps/api/src/services/<name>.service.ts` as a pure class (port the NestJS `@Injectable` if not). Wire it into `apps/api/src/app/container.ts`.
3. Create `apps/api/src/rpc-hono/handlers/<name>.ts`:
   ```typescript
   import { os } from '../orpc';

   export const myHandler = os.<name>.<proc>.handler(async ({ input, context }) => {
     return await context.container.services.<name>.method(input.foo);
   });

   export const <name>Router = os.<name>.router({ ... });
   ```
3. Replace stub in `apps/api/src/rpc/router.ts` with the real router.
4. (Optional) Delete the legacy `@Controller()` after frontends switch — keep during migration for safety.

### Frontend usage

```typescript
import { createWeb3InsightClient } from '@web3insight/orpc-client';
import { env } from '@/env';

export const { client, orpc } = createWeb3InsightClient({
  url: `${env.DATA_API_URL}/rpc`,
  token: () => getCookie('auth-token'),
});

// In a component:
const { data } = useQuery(orpc.total.repos.queryOptions({ input: { eco_name: 'all' } }));
```

Type safety is end-to-end: any contract change in `packages/api-contract` propagates to both NestJS handlers and Next.js components.

## Per-app guides

- `apps/api/CLAUDE.md` (legacy NestJS architecture — still authoritative for REST controllers)
- `apps/dashboard/CLAUDE.md` (DDD layout, Jotai, TanStack Query, AI copilot)
- `apps/web/CLAUDE.md` (if present)
- `apps/dev-card/CLAUDE.md` (Privy + ecosystem theming + card generation)

## Known issues / migration notes

- **TypeScript `|| true` in typecheck scripts**: legacy escape valve — being phased out as type errors get fixed.
- **`ignoreBuildErrors: true`** in `next.config.ts`: workaround for third-party types lagging behind React 19. Re-enable strict checks once libs catch up.
- **dev-card uses `next build --webpack`**: oRPC compatibility issue with Turbopack at build time (dev with Turbopack is fine). Revisit when oRPC publishes Turbopack-compatible runtime.
- **NestJS TokenPoolService is in-memory**: will be replaced by Upstash Redis for Vercel cold-start stability. See `apps/api/src/app/db/pool.services.ts`.

## Reference monorepos

- `cardbox/` — closest analog (NestJS + Next.js + Drizzle)
- `euka/euka/` — gold standard for Turborepo + Vercel deploys
- `ai-mage/aimage-monorepo/` — oRPC contract-first reference

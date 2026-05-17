# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Project Overview

**Web3Insight** is a Web3 developer analytics platform organized as a Turborepo + pnpm monorepo. Single GitHub repo: `web3insight-ai/web3insight`.

| Package | Path | Stack | Default port | Deploy target |
|---|---|---|---|---|
| `@web3insight/api` | `apps/api` | Hono + oRPC + Kysely + PostgreSQL + Inngest | 3010 | Vercel Build Output API (HTTP + Cron) |
| `@web3insight/dashboard` | `apps/dashboard` | Next.js 16 + Turbopack + oRPC client | 3000 | Vercel |
| `@web3insight/web` | `apps/web` | Next.js 16 + oRPC client | 3001 | Vercel |
| `@web3insight/dev-card` | `apps/dev-card` | Next.js 16 + Privy + oRPC client | 3002 | Vercel |

Data sources: GitHub API, OSS Insight, RSS3, Privy.

### Shared packages (`packages/*`)

| Package | Purpose |
|---|---|
| `@web3insight/api-contract` | Single source of truth for all RPC contracts — Zod schemas + oRPC procedure signatures (8 sub-routers: total/rank/repo/auth/admin/custom/donate/github, 47 procedures total) |
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
web ────────┼──▶ api (Hono + oRPC) ──▶ PostgreSQL (Kysely)
            │           │
dev-card ───┘           ├──▶ Inngest (durable sync workflows)
                        ├──▶ GitHub API / OSS Insight / RSS3
                        ├──▶ OpenAI / OpenRouter
                        └──▶ Privy
```

All 3 frontends call `api` through end-to-end typed oRPC procedures defined in `@web3insight/api-contract`. The API ships as **two Vercel Functions** bundled via `apps/api/scripts/bundle-functions.ts` (esbuild → `.vercel/output/functions/`):

1. **`api/hono.func`** (`src/serverless/api-hono.ts`) — catch-all HTTP entry. Mounts the full oRPC router at `/rpc/*` (47/47 procedures) plus a legacy `/v1/*` + `/v2/*` REST shim via `OpenAPIHandler` for any external client still on the REST shape. `vercel.json` catch-all rewrites every URL to `/api/hono?path=<original>`; the entry reconstructs the pathname before dispatching to Hono. The Vercel `Nodejs` launcher passes Node `(req, res)`, so the entry builds a Web `Request` from `IncomingMessage`, runs `app.fetch`, and pipes the `Response` back to `ServerResponse`. Imports `reflect-metadata` at the top because legacy DTOs under `src/api/dto/` still carry class-validator decorators.
2. **`api/cron/cache-clear.func`** (`src/serverless/cron-cache-clear.ts`) — Vercel Cron entry (daily at 04:00 UTC, defined in `apps/api/vercel.json` `crons`). Bearer-authed via `CRON_SECRET`. Replaces the legacy `cache:clear` `nestjs-console` command.

Long-running sync jobs (~11 of them) live in `apps/api/src/inngest/functions/*.ts` and are triggered either by cron handlers (`inngest.send({ name: 'sync/...' })`) or by Inngest's own schedule, so step-checkpointed work survives Vercel function timeouts.

JWTs are minted and verified by `src/services/auth.service.ts` (the Phase D Privy-only port of the original NestJS AuthService). The Hono `auth` middleware in `src/app/middleware/auth.ts` validates them and populates `context.user` for downstream oRPC handlers. `apps/api/jwt-verify.mjs` at the repo root is a one-off debugging helper for `DATA_API_TOKEN`.

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

# API has no `dev` script — run locally with `vercel dev` (and
# `npx inngest-cli dev` if exercising Inngest workflows):
cd apps/api && vercel dev   # port 3010

# Build everything (turbo-cached)
pnpm build

# Lint / typecheck / test (all turbo-cached)
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e

# Dependency hygiene
pnpm syncpack:lint            # check version consistency
pnpm syncpack:fix             # auto-fix mismatches

# Bundle apps/api into Vercel Build Output (.vercel/output/functions/*)
pnpm --filter @web3insight/api build
```

> The `nestjs-console` runner was removed in the L5 purge along with the root `console:dev` / `console:prod` scripts. Any remaining ad-hoc job should be wired into Inngest (`apps/api/src/inngest/functions/`) and scheduled via `vercel.json` `crons`.

## Workspace conventions

- **Internal deps**: `workspace:*`. Run `pnpm syncpack:lint` to enforce.
- **External deps**: prefer `catalog:` (defined in `pnpm-workspace.yaml`) for shared versions. App-local versions OK for unique deps.
- **Node**: `>= 22.0.0` (see `.nvmrc`).
- **pnpm**: pinned to `10.29.3` via root `package.json` `packageManager`.
- **TypeScript**: 6.0.3 across all packages (`catalog:typescript`).
- **Module type**: `"type": "module"` at the root — keep ESM-first imports.

## Deployment

### Vercel — 4 projects

Each app has its own Vercel project, all pointing to the same Git repo with different Root Directories:

| Project | Root | Production branch | Preview alias |
|---|---|---|---|
| `web3insight-dashboard` | `apps/dashboard` | `main` | `dev` → `dev.web3insight.ai` (DNS not yet cut over) |
| `web3insight-web` | `apps/web` | `main` | `dev` |
| `web3insight-dev-card` | `apps/dev-card` | `main` | `dev` |
| `web3insight-api` | `apps/api` | `main` | `dev` |

The `api` project does **not** use `@vendia/serverless-express` or any framework auto-detection — `vercel.json` sets `"framework": null` and the build script (`tsx scripts/bundle-functions.ts`) writes ready-to-serve functions into `.vercel/output/functions/` using esbuild. This avoids the Vercel pipeline scanning `src/serverless/*` and triggering per-file installs that would choke on `workspace:*` references.

**Each Vercel project requires env vars set in both `production` and `preview` scopes.** See `apps/<name>/.env.example` for the variable list per app.

### Production routing (not on Vercel yet)

`dash.web3insight.ai` (production) currently still resolves through a Cloudflare Tunnel to the legacy self-hosted Docker stack. The `*.dev.web3insight.ai` records are absent. **Vercel readiness ≠ production cutover** — moving production DNS and decommissioning the Docker hosts is a separate, deliberate step.

The legacy `apps/api/Dockerfile` and `apps/api/deploy/` artefacts are retained as a fallback for the self-hosted path until the Cloudflare → Vercel cutover is done.

## oRPC contract-first architecture

Frontends consume `@web3insight/api-contract` directly — there are no REST endpoints to maintain on the client side. Backend handlers in `apps/api/src/rpc-hono/handlers/` implement the contract via oRPC's `os.<router>.<proc>.handler(...)` builder.

### Migration status (Hono runtime — `apps/api/src/rpc-hono/handlers/`)

| Sub-contract | Procedures | Handler | Notes |
|---|---|---|---|
| `total` | 6 | `handlers/total.ts` | via `container.services.cache` |
| `donate` | 5 | `handlers/donate.ts` | contract redesigned to `{ repo_full_name }` shape |
| `github` | 1 | `handlers/github.ts` | |
| `repo` | 1 | `handlers/repo.ts` | |
| `rank` | 6 | `handlers/rank.ts` | |
| `admin` | 4 | `handlers/admin.ts` | auth-protected |
| `custom` | 11 | `handlers/custom.ts` | |
| `auth` | 13 | `handlers/auth.ts` | Phase D port — Privy-only + OpenBuild bind; legacy GitHub OAuth + wallet bind + magic number were intentionally dropped |

**47 of 47 procedures live on Hono.** REST `/v1/*` + `/v2/*` paths are only kept as an `OpenAPIHandler`-backed compatibility shim for external consumers — no in-repo frontend depends on them.

### How to add a new endpoint

1. Define the schema + procedure in `packages/api-contract/src/routers/<name>.ts` using `oc.tag('X').router({ ... })`. Re-export it from `packages/api-contract/src/index.ts`.
2. Make sure the underlying business logic is a pure class in `apps/api/src/services/<name>.service.ts` and wired into `apps/api/src/app/container.ts`.
3. Implement the handler in `apps/api/src/rpc-hono/handlers/<name>.ts`:
   ```typescript
   import { os } from '../orpc';

   export const myHandler = os.<name>.<proc>.handler(async ({ input, context }) => {
     return await context.container.services.<name>.method(input.foo);
   });

   export const <name>Router = os.<name>.router({ /* … */ });
   ```
4. Mount the router in `apps/api/src/rpc-hono/router.ts`.

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

Type safety is end-to-end: any contract change in `packages/api-contract` propagates to both backend handlers and Next.js components at typecheck time.

## Skills system

Project skills are managed with [`npx skills`](https://github.com/anthropics/skills) (the same pattern used by `cardbox/`). Two mirrored directories hold the same content:

- `.claude/skills/` — picked up by Claude Code
- `.agents/skills/` — picked up by other agents that look for the universal `.agents/` convention

`skills-lock.json` at the repo root is the source of truth. Restore the tree on a fresh checkout with:

```bash
npx skills experimental_install
```

Install a new skill (always pass both targets, copy mode so the file lives in the repo):

```bash
npx skills add <owner/repo> -a claude-code -a universal -s <skill-name> -y --copy
```

Currently installed (31 skills):

| Category | Skills |
|---|---|
| **Hono / Next.js / Vercel** | `hono`, `next-best-practices`, `next-cache-components`, `next-upgrade`, `vercel-composition-patterns`, `vercel-cli-with-tokens`, `vercel-react-best-practices`, `vercel-react-view-transitions`, `deploy-to-vercel`, `web-design-guidelines` |
| **Monorepo tooling** | `turborepo` (official `vercel/turborepo` skill — pipeline/cache/filtering/CI), `monorepo-management`, `pnpm` |
| **Auth / DB** | `privy`, `drizzle-orm-patterns` (reference only — we use Kysely) |
| **General engineering** | `api-error-handling`, `api-rate-limiting`, `api-versioning-strategy`, `secrets-management`, `frontend-state-management`, `query-caching-strategies`, `integration-testing`, `unit-testing-framework`, `e2e-testing-automation`, `semantic-versioning`, `markdown-documentation`, `logging-best-practices`, `troubleshooting-guide`, `pull-request-automation` |
| **Claude Code workflow** | `skill-creator`, `mcp-builder`, `webapp-testing` |

When invoking, just type `/<skill-name>` — Claude Code will read the matching `SKILL.md`.

## Per-app guides

- `apps/api/README.md` — layout + scripts + dev workflow
- `apps/api/AGENTS.md` — SQL / Kysely conventions and `data.*` schema rules
- `apps/dashboard/CLAUDE.md` — DDD layout, Jotai, TanStack Query, AI copilot
- `apps/dev-card/CLAUDE.md` — Privy + ecosystem theming + card generation

## Known issues / migration notes

- **Legacy DTOs in `apps/api/src/api/dto/`** still carry class-validator + `@ApiProperty` (a local stub since `@nestjs/swagger` was removed). They force `reflect-metadata` at every serverless entry. Cleanup is tracked but low-priority.
- **TypeScript `|| true` in some typecheck scripts**: legacy escape valve — being phased out as type errors get fixed.
- **`ignoreBuildErrors: true`** in `next.config.ts`: workaround for third-party types lagging behind React 19. Re-enable strict checks once libs catch up.
- **dev-card uses `next build --webpack`**: oRPC compatibility issue with Turbopack at build time (dev with Turbopack is fine). Revisit when oRPC publishes Turbopack-compatible runtime.
- **Production DNS still on Cloudflare Tunnel**: `dash.web3insight.ai` → legacy Docker; Vercel deployments are validated on `dev` only. E2E against Vercel previews currently blocked by Vercel SSO + local-to-Vercel HTTPS timeouts.

## Reference monorepos

- `cardbox/` — closest analog (Hono + Privy + Turborepo + Vercel + `npx skills` layout). Source of the skills convention adopted here.
- `euka/euka/` — gold standard for Turborepo + Vercel deploys.
- `ai-mage/aimage-monorepo/` — oRPC contract-first reference.

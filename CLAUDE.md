# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Project Overview

**Web3Insight** is a Web3 developer analytics platform organized as a Turborepo + pnpm monorepo. Single GitHub repo: `web3insight-ai/web3insight`.

| Package | Path | Stack | Default port | Deploy target |
|---|---|---|---|---|
| `@web3insight/api` | `apps/api` | NestJS 11 + Kysely + PostgreSQL | 3010 | Vercel (HTTP) + Railway (console workers) |
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

The 3 frontends call `api` via **two coexisting paths**:
1. **Legacy REST** — `/v1/*` and `/v2/*` controllers (still active for unmigrated endpoints)
2. **oRPC** — `/rpc/*` mounted via `RpcController` in `apps/api/src/rpc/rpc.controller.ts`, using shared contracts from `@web3insight/api-contract`

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

The NestJS console commands (`sync:rank`, `sync:repos`, `sync:db:actors:*`, etc.) cannot run on Vercel Functions (>800s runtime) and continue to be deployed as Docker images via `apps/api/Dockerfile`.

Two services: `web3insight-api-worker-prod` (master branch) and `web3insight-api-worker-dev` (dev branch).

## oRPC contract-first migration

Migration is **gradual** — REST controllers in `apps/api/src/api/controller/` and oRPC handlers in `apps/api/src/rpc/handlers/` coexist. Each endpoint is migrated 1-by-1.

### Migration status

| Sub-contract | Status | Path |
|---|---|---|
| `total` | ✅ Full | `apps/api/src/rpc/handlers/total.ts` |
| `rank` | 🚧 Stub (NOT_IMPLEMENTED) | `handlers/stubs.ts` |
| `repo` | 🚧 Stub | `handlers/stubs.ts` |
| `auth` | 🚧 Stub | `handlers/stubs.ts` |
| `admin` | 🚧 Stub | `handlers/stubs.ts` |
| `custom` | 🚧 Stub | `handlers/stubs.ts` |
| `donate` | 🚧 Stub | `handlers/stubs.ts` |
| `github` | 🚧 Stub | `handlers/stubs.ts` |

### How to migrate one controller from REST → oRPC

1. Confirm contract exists in `packages/api-contract/src/routers/<name>.ts`. If not, define using `oc.tag('X').router({ ... })`.
2. Create `apps/api/src/rpc/handlers/<name>.ts` with handler implementations:
   ```typescript
   import { os } from '../orpc';
   import { getRegistry } from '../service-registry';

   export const myHandler = os.<name>.<proc>.handler(async ({ input, context }) => {
     const registry = getRegistry();
     return await registry.<service>.method(input.foo);
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

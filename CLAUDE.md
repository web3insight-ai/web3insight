# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this monorepo.

## Project Overview

**Web3Insight** is a Web3 developer analytics platform organized as a Turborepo + pnpm monorepo. Single GitHub repo: `web3insight-ai/web3insight`.

| Package | Path | Stack | Default port | Deploy target |
|---|---|---|---|---|
| `@web3insight/api` | `apps/api` | Hono + oRPC + Drizzle + PostgreSQL + Inngest | 3010 | Vercel Build Output API (HTTP + Cron) |
| `@web3insight/dashboard` | `apps/dashboard` | Next.js 16 + Turbopack + oRPC client | 3000 | Vercel |
| `@web3insight/web` | `apps/web` | Next.js 16 + oRPC client | 3001 | Vercel |
| `@web3insight/dev-card` | `apps/dev-card` | Next.js 16 + Privy + oRPC client | 3002 | Vercel |
| `@web3insight/indexer` | `apps/indexer` | Rust 2024 (tokio + sqlx + octocrab) | n/a (CLI) | GitHub Releases binaries |

Data sources: GitHub API, OSS Insight, RSS3, Privy. The `indexer` is a one-shot CLI binary that ingests GHArchive events into the shared PostgreSQL `data.*` schema consumed by `apps/api`.

### Shared packages (`packages/*`)

| Package | Purpose |
|---|---|
| `@web3insight/api-contract` | Single source of truth for all RPC contracts — Zod schemas + oRPC procedure signatures (8 sub-routers: total/rank/repo/auth/admin/custom/donate/github, 47 procedures total) |
| `@web3insight/orpc-client` | Typed RPC client factory (`createWeb3InsightClient`) + TanStack Query integration |
| `@web3insight/env-base` | Shared `@t3-oss/env-nextjs` schema fragments (DATA_API_URL, DATA_API_TOKEN, HTTP_TIMEOUT) |
| `@web3insight/query-keys` | TanStack Query key factory + STATS/USER cache option presets |
| `@web3insight/auth-privy` | Shared Privy provider + `usePrivyAuthSync` JWT-exchange hook |
| `@web3insight/contracts` | Solidity Foundry project — Web3Insight Monad NFT (ERC721). Build/test/format via `forge` wrapped in package.json scripts. Depends on `forge-std` + `openzeppelin-contracts` (registered in root `.gitmodules`) |

### Other top-level directories

| Path | Purpose |
|---|---|
| `tools/graph/` | Neo4j research toolkit imported from the (deprecated) `web3insight-data` repo — `cypher/` holds PageRank / Dijkstra / repo community detection algorithms over the `data.*` PG schema. No app consumes them yet; landing here so future api/dashboard work can surface graph analytics. |
| `external/crypto-ecosystems` | **Submodule** — fork of `electric-capital/open-dev-data` (188MB Python taxonomy of crypto/blockchain ecosystems). Pinned by commit SHA so the monorepo size stays small. Bump with `git submodule update --remote external/crypto-ecosystems`. |

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
web ────────┼──▶ api (Hono + oRPC) ──▶ PostgreSQL (Drizzle)
            │           │                       ▲
dev-card ───┘           ├──▶ Inngest             │  data.*
                        ├──▶ GitHub API          │  schema
                        ├──▶ OSS Insight / RSS3  │
                        ├──▶ OpenAI / OpenRouter │
                        └──▶ Privy               │
                                                 │
                  GHArchive ──▶ indexer (Rust) ──┘
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

# First clone — also fetch submodules (Foundry deps + crypto-ecosystems fork)
git submodule update --init --recursive

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

# Indexer (Rust) — requires the stable Rust toolchain (rustup default stable)
pnpm --filter @web3insight/indexer build       # cargo build --release
pnpm --filter @web3insight/indexer start       # cargo run --release
pnpm --filter @web3insight/indexer test        # cargo test --all
pnpm --filter @web3insight/indexer lint        # cargo clippy -D warnings
pnpm --filter @web3insight/indexer format      # cargo fmt --all

# Contracts (Solidity) — requires Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
pnpm --filter @web3insight/contracts build     # forge build
pnpm --filter @web3insight/contracts test      # forge test
pnpm --filter @web3insight/contracts format    # forge fmt
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

### Indexer — GitHub Releases binaries

`apps/indexer` is a one-shot Rust CLI that downloads GHArchive files and bulk-inserts events into the shared `data.*` schema. It is **not** deployed to Vercel.

- `.github/workflows/indexer-ci.yml` runs `cargo fmt --check`, `cargo clippy -D warnings`, and `cargo test` on every push/PR that touches `apps/indexer/**`.
- `.github/workflows/indexer-build.yml` triggers on `indexer-v*` tag pushes (or `workflow_dispatch`) and produces cross-platform binaries (`x86_64-apple-darwin`, `aarch64-apple-darwin`, `x86_64-unknown-linux-gnu`), uploading each as a GitHub Release asset.
- Cut a release with: `git tag indexer-v0.x.y && git push origin indexer-v0.x.y`. The root `release.yml` (`v*` → changelogithub) excludes `indexer-v*` so the two tag namespaces never collide.
- Runs against any PostgreSQL with the `data` schema; see `apps/indexer/.env.example` for required env vars (`DATABASE_URL`, time-window + concurrency knobs).

**Each Vercel project requires env vars set in both `production` and `preview` scopes.** See `apps/<name>/.env.example` for the variable list per app.

### Production routing (Vercel-only)

All 4 production domains resolve to Vercel as of the 2026-05-27 cutover:

- `api.web3insight.ai` → `web3insight-api`
- `dash.web3insight.ai` → `web3insight-dashboard`
- `card.web3insight.ai` → `web3insight-dev-card`
- `web3insight.ai` → `web3insight-web`

The legacy Cloudflare Tunnel + self-hosted Docker path is decommissioned. `apps/api/Dockerfile` and `apps/api/deploy/` are kept in-repo as historical reference but not deployed anywhere.

**Heads-up — `JWT_SECRET` literal:** the secret is stored verbatim in the Vercel env (`web3insight-api` project, production + preview). `$$` in a `.env` file or docker-compose loader expands to `$`, but Vercel does **not** do that substitution — what you paste in the Vercel UI is exactly what `process.env.JWT_SECRET` reads. Mint service tokens against the literal stored value, not a shell-interpolated copy.

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

Currently installed (43 skills):

| Category | Skills |
|---|---|
| **Hono / Next.js / Vercel** | `hono`, `next-best-practices`, `next-cache-components`, `next-upgrade`, `vercel-composition-patterns`, `vercel-cli-with-tokens`, `vercel-react-best-practices`, `vercel-react-view-transitions`, `deploy-to-vercel`, `web-design-guidelines` |
| **Monorepo tooling** | `turborepo` (official `vercel/turborepo` skill — pipeline/cache/filtering/CI), `monorepo-management`, `pnpm` |
| **Auth / DB** | `privy`, `drizzle-orm-patterns` |
| **Frontend & forms** | `tanstack-query-best-practices`, `tailwind-design-system`, `frontend-design`, `react-hook-form`, `zod`, `frontend-state-management` |
| **Testing** | `vitest`, `playwright-best-practices`, `playwright-cli`, `unit-testing-framework`, `integration-testing`, `e2e-testing-automation`, `webapp-testing` |
| **Security** | `api-security-hardening`, `xss-prevention`, `csrf-protection`, `sql-injection-prevention`, `secrets-management` |
| **General engineering** | `api-error-handling`, `api-rate-limiting`, `api-versioning-strategy`, `query-caching-strategies`, `semantic-versioning`, `markdown-documentation`, `logging-best-practices`, `troubleshooting-guide`, `pull-request-automation` |
| **Claude Code workflow** | `skill-creator`, `mcp-builder` |

When invoking, just type `/<skill-name>` — Claude Code will read the matching `SKILL.md`.

## Per-app guides

- `apps/api/README.md` — layout + scripts + dev workflow
- `apps/api/AGENTS.md` — SQL / Drizzle conventions and `data.*` schema rules
- `apps/dashboard/CLAUDE.md` — DDD layout, Jotai, TanStack Query, AI copilot
- `apps/dev-card/CLAUDE.md` — Privy + ecosystem theming + card generation
- `apps/indexer/README.md` (+ `README_CN.md`) — Rust CLI usage, env vars, schema notes
- `packages/contracts/README.md` — Foundry layout, deployed Monad NFT address, deploy script
- `tools/graph/readme.md` — Neo4j install + PG→Neo4j ETL + Cypher algorithm catalogue

## Related repositories (web3insight-ai org)

Historical lineage for context (use `git log -- apps/<name>/` for the full per-app history backfilled into this repo):

| Repo | Status | Notes |
|---|---|---|
| `web3insight-api` | merged into `apps/api` | 266 commits backfilled, original repo retained as read-only mirror |
| `web3insight-dev-card` | merged into `apps/dev-card` | 72 commits backfilled |
| `web3insight.ai` | merged into `apps/web` | 33 commits backfilled (landing page) |
| `web3insight-indexer` | merged into `apps/indexer` | 33 commits, still updated upstream until cutover |
| `web3insight-contracts` | merged into `packages/contracts` | 3 commits, Foundry Monad NFT |
| `web3insight-data` | **partial** merge into `tools/graph` | only `for_neo4j/` subdirectory (1 commit); SQL/ and Data_process/ superseded by api + indexer |
| `crypto-ecosystems` | submodule at `external/crypto-ecosystems` | fork of `electric-capital/open-dev-data`; 188MB, pinned by SHA |
| `web3insight-profile` / `n8n-workflows` / `web3insight-ai-service` / `strapi-cms` / `agent-db` / `demo-repository` / `parser-demo` | **archived on GitHub** | superseded or unused; read-only on GitHub for historical reference |
| `gharchive-downloader` / `indexer-rs` | archived (pre-existing) | predecessors of `web3insight-indexer` |

## Known issues / migration notes

- **Legacy DTOs in `apps/api/src/api/dto/`** still carry class-validator + `@ApiProperty` (a local stub since `@nestjs/swagger` was removed). They force `reflect-metadata` at every serverless entry. Cleanup is tracked but low-priority.
- **TypeScript `|| true` in some typecheck scripts**: legacy escape valve — being phased out as type errors get fixed.
- **`ignoreBuildErrors: true`** in `next.config.ts`: workaround for third-party types lagging behind React 19. Re-enable strict checks once libs catch up.
- **dev-card uses `next build --webpack`**: oRPC compatibility issue with Turbopack at build time (dev with Turbopack is fine). Revisit when oRPC publishes Turbopack-compatible runtime.
- **Vercel preview deploys still blocked from local E2E**: Vercel SSO + local-to-Vercel HTTPS timeouts make running Playwright against preview URLs unreliable. E2E currently runs against prod or local dev only.
- **Frontend `DATA_API_TOKEN` is a service JWT signed with prod `JWT_SECRET`**: dashboard/web/dev-card SSR call `api.web3insight.ai/rpc/*` via this token. If the api project's `JWT_SECRET` is rotated, this token must be re-minted (`uid=1, type=admin`) and re-set on all three frontend Vercel projects, or auth-gated endpoints (`rank/*`, `admin/*`, `auth/*`) return 401 and tables/dashboards render empty.

## Reference monorepos

- `cardbox/` — closest analog (Hono + Privy + Turborepo + Vercel + `npx skills` layout). Source of the skills convention adopted here.
- `euka/euka/` — gold standard for Turborepo + Vercel deploys.
- `ai-mage/aimage-monorepo/` — oRPC contract-first reference.

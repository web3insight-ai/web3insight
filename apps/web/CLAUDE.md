# CLAUDE.md

Project-scoped guidance for `apps/web` (`@web3insight/web`). For monorepo-wide conventions, deployment topology, and skill policy, see `../../CLAUDE.md`.

## Project overview

Web3Insight public landing and product website. It is a Next.js 16 App Router app running on Vercel as the `web3insight-web` project, production domain `https://web3insight.ai`, local dev port `3001`.

The app is mostly marketing/product UI, but it can read live platform stats through the shared typed oRPC client and `@web3insight/api-contract`.

## Essential commands

```bash
pnpm dev:web                         # local dev on :3001
pnpm --filter @web3insight/web build
pnpm --filter @web3insight/web lint
pnpm --filter @web3insight/web typecheck
```

`typecheck` currently exits 0 via `|| true`; still inspect output when touching types.

## Structure

```text
src/app/                 # App Router layout/page/globals
src/components/           # landing sections, blueprint visual system, UI primitives
src/lib/orpc/             # shared oRPC client/router wiring
src/lib/query/            # TanStack Query client/provider helpers
src/services/api/         # API-facing repository helpers
src/clients/http/         # legacy/generic HTTP client helpers
src/env.ts                # @t3-oss/env-nextjs validation
```

## Coding rules

- Prefer Server Components by default. Add `'use client'` only for animation, browser APIs, event handlers, TanStack Query, or context providers.
- Keep copy and visuals marketing-quality; use `frontend-design` / `web-design-guidelines` for substantial UI changes.
- Prefer the shared oRPC client and `@web3insight/query-keys` cache presets for live data. Avoid introducing new hardcoded REST calls when a contract procedure exists.
- Keep environment reads in `src/env.ts`; do not access `process.env` ad hoc in components.
- The old README mentions Remix/NextUI and is historical. Current code is Next.js 16 + Tailwind v4 + oRPC.

## Environment

Use `env.example` as the safe reference. Required for live data:

- `DATA_API_URL` — backend base URL, usually `https://api.web3insight.ai`
- `DATA_API_TOKEN` — service JWT for server-side API calls
- `HTTP_TIMEOUT` — optional timeout
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — optional analytics

Do not read or print `.env.local`.

## Verification

- UI/layout-only change: `pnpm --filter @web3insight/web lint` plus browser smoke if visual.
- Data/API change: run `pnpm --filter @web3insight/web typecheck` and verify the RPC/network path in browser or with a minimal request.
- Deployment issue: inspect Vercel project `web3insight-web` first, then API project if network calls fail.

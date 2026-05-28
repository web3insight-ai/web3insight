# Web App Guide

Scope: `apps/web/**`. Inherit the root guide; this file covers public-site rules.

## Surface

- Package: `@web3insight/web`
- Production: `https://web3insight.ai`, Vercel project `web3insight-web`.
- Local: `pnpm dev:web`, port `3001`.
- Stack: Next.js 16 App Router, React 19, Tailwind 4, oRPC/TanStack Query for live stats.

## Commands

```bash
pnpm dev:web
pnpm --filter @web3insight/web lint
pnpm --filter @web3insight/web typecheck
pnpm --filter @web3insight/web build
```

`typecheck` currently exits 0 via `|| true`; inspect output when touching types.

## Code Map

```text
src/app/              # App Router layout/page/globals
src/components/       # landing sections, blueprint visual system, UI primitives
src/lib/orpc/         # shared oRPC client/router wiring
src/lib/query/        # TanStack Query client/provider helpers
src/services/api/     # API-facing repository helpers
src/env.ts            # @t3-oss/env-nextjs validation
```

## Product Rules

- This is the marketing/product site; keep copy and visual changes polished.
- Prefer Server Components. Use `'use client'` only for animation, browser APIs, events, TanStack Query, or providers.
- Prefer shared oRPC and `@web3insight/query-keys` for live data; avoid new hardcoded REST calls when a contract exists.
- Keep env reads in `src/env.ts`; do not access `process.env` ad hoc in components.
- Ignore old README references to Remix/NextUI; current code is Next.js 16 + Tailwind 4 + oRPC.

## Verification

UI/layout changes need lint plus browser smoke when visual. Data changes need typecheck and RPC/network verification. Deployment issues start with `web3insight-web` Vercel logs, then `web3insight-api` if network calls fail.

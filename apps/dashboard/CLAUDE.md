# Dashboard App Guide

Scope: `apps/dashboard/**`. Inherit the root guide; this file covers dashboard-specific rules.

## Surface

- Package: `@web3insight/dashboard`
- Production: `https://dash.web3insight.ai`, Vercel project `web3insight-dashboard`.
- Local: `pnpm dev:dashboard`, port `3000`.
- Stack: Next.js 16 App Router, React 19, Turbopack, TanStack Query, oRPC, Jotai, HeroUI, Tailwind 4.

## Commands

```bash
pnpm dev:dashboard
pnpm --filter @web3insight/dashboard lint
pnpm --filter @web3insight/dashboard typecheck
pnpm --filter @web3insight/dashboard build
```

`typecheck` may be softened by legacy `|| true`; still inspect output when touching types.

## Code Map

```text
src/app/                 # App Router routes, layouts, API route handlers, atoms
src/services/<domain>/   # domain typing, repository, helper, views, widgets, hooks
src/lib/orpc.ts          # preferred typed oRPC + TanStack Query entry
src/lib/api/*            # legacy REST proxy client/types; avoid for new contract-backed work
src/lib/form/*           # React Hook Form + HeroUI helpers
src/hooks/api/           # TanStack Query hooks/queryOptions
src/components/          # shared controls, loading states, widgets
```

## Product Rules

- Prefer typed oRPC (`@web3insight/api-contract`) over legacy REST proxies.
- oRPC procedures return plain data; legacy REST route handlers use `ResponseResult<T>` envelopes only when still needed.
- Server Components by default. Use `'use client'` only for hooks, browser APIs, event handlers, TanStack Query, Jotai, or forms.
- Keep domain code inside its `src/services/<domain>/` folder unless it is truly shared.
- Do not read or print `.env.local`; use `.env.example`, `src/env.ts`, or Vercel env metadata.

## Debugging

Start with browser console/network. If API calls fail, inspect `web3insight-dashboard` deployment logs first, then `web3insight-api` `/rpc` logs and auth payloads. Query Postgres only after UI/API evidence points to data shape or missing rows.

## Verification

- UI-only: dashboard lint plus browser smoke when visual.
- Data/API: dashboard typecheck and affected API/contract checks.
- Auth/admin/rank changes: verify backend token/cookie behavior, not just component rendering.

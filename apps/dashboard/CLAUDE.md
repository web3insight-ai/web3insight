# CLAUDE.md

Project-scoped guidance for `apps/dashboard` (`@web3insight/dashboard`).
For monorepo-wide conventions see `../../CLAUDE.md`.

## Project overview

The Web3Insight analytics dashboard — Next.js 16 App Router (Turbopack in dev,
webpack in prod build of dev-card only; dashboard uses Turbopack throughout).
Lives in the Turborepo monorepo alongside `@web3insight/api` (Hono + oRPC),
`@web3insight/web` (landing), `@web3insight/dev-card`, and the shared
`packages/*` (api-contract, orpc-client, query-keys, env-base, auth-privy).

## Essential commands

```bash
pnpm dev:dashboard          # local dev on :3000 (Turbopack)
pnpm --filter @web3insight/dashboard build
pnpm --filter @web3insight/dashboard lint
pnpm --filter @web3insight/dashboard typecheck
```

Run from repo root or with `--filter`. Pre-commit hooks enforce 2-space
indent, semicolons, and Prettier formatting.

## Production / debugging

- Vercel project: `web3insight-dashboard`; production domain `https://dash.web3insight.ai`.
- For deployment issues, inspect Vercel deployment/build/runtime logs before changing code. If API calls fail, then inspect `web3insight-api` logs and `/rpc` payload/auth.
- Browser verification should check console + network first; only pull Postgres facts when the UI/API evidence points to data shape or missing rows.
- Do not read or print `.env.local`; use `.env.example`, Vercel env names, or ask for the specific value.

## Architecture

Next.js 16 App Router with Domain-Driven Design under `/src/`.

### `/src/app/` — routes & API

- `page.tsx` / `layout.tsx` — route segments and layouts
- `api/` — Next.js Route Handlers that proxy or compose backend calls
- `atoms.ts` — Jotai global state atoms

### `/src/services/` — domain modules

Each domain follows:

```
domain/
├── typing.ts        # type definitions
├── repository.ts    # data access (API calls)
├── helper.ts        # business logic
├── views/           # page-level components
├── widgets/         # reusable UI for this domain
└── hooks/           # domain-specific hooks (optional)
```

Domains: admin, ai, auth, developer, ecosystem, event, github,
profile-analysis, repository, x402.

### `/src/lib/` — shared infrastructure

- `orpc.ts` — typed oRPC client + TanStack Query utils (preferred)
- `api/client.ts` — legacy REST proxy client (use only for routes not yet on oRPC)
- `api/types.ts` — shared REST response types
- `query/keys.ts` — TanStack Query key factory for non-RPC keys
- `form/components.tsx` — React Hook Form + HeroUI form components

### `/src/hooks/api/` — data-fetching hooks

TanStack Query hooks with the queryOptions factory pattern:

```typescript
// oRPC-backed (preferred)
"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { STATS_CACHE_OPTIONS } from "@web3insight/query-keys";

export function useTotalReposRpc(ecoName = "all") {
  return useQuery({
    ...orpc.total.repos.queryOptions({ input: { eco_name: ecoName } }),
    ...STATS_CACHE_OPTIONS,
  });
}
```

```typescript
// REST-backed (legacy — only for endpoints not in @web3insight/api-contract)
import { useQuery, queryOptions } from "@tanstack/react-query";

export const ecosystemQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: queryKeys.ecosystems.list(),
      queryFn: async () => {
        /* fetch from Next.js Route Handler */
      },
      staleTime: 5 * 60 * 1000,
    }),
};
```

### `/src/components/` — shared UI

- `controls/` — complex reusable components
- `loading/` — skeleton components
- `widgets/` — specialized UI widgets

## Path aliases

```
@env  → ./src/env.ts
@/*   → ./src/*
~/*   → ./src/services/*
#/*   → ./src/app/*
$/*   → ./src/components/*
```

## Key patterns

### Data fetching — prefer oRPC

End-to-end typed via `@web3insight/api-contract`. All 47 procedures live on
the Hono runtime; legacy REST `/v1` / `/v2` paths are only kept as a
compatibility shim for external consumers.

```typescript
"use client";
import { orpc } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";

const { data } = useQuery(
  orpc.total.repos.queryOptions({ input: { eco_name: "all" } }),
);
```

### Forms with React Hook Form + Zod

```typescript
'use client';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/lib/form/components';
import { z } from 'zod';

const schema = z.object({ name: z.string().min(1) });

function MyForm() {
  const methods = useForm({ resolver: zodResolver(schema) });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="name" label="Name" />
      </form>
    </FormProvider>
  );
}
```

### REST response shape (legacy proxy routes only)

Next.js Route Handlers that still proxy REST use `ResponseResult<T>` from
`/src/lib/api/types.ts`:

```typescript
interface ResponseResult<T> {
  success: boolean;
  data: T;
  message: string;
  code: string;
}
```

oRPC procedures return plain data — no envelope.

### Server vs Client Components

- Default: Server Components (no directive)
- `'use client'` only for: hooks, browser APIs, event handlers, TanStack Query

## Environment variables

Validated via `@t3-oss/env-nextjs` in `/src/env.ts`.

**Required**

- `DATA_API_URL` — `@web3insight/api` base URL (the oRPC client appends `/rpc`)
- `DATA_API_TOKEN` — service token sent as Bearer on server-side calls
- `OPENAI_API_KEY` — OpenAI key for the AI copilot

**Optional**

- `OSSINSIGHT_URL` — OSS Insight API
- `OPENAI_BASE_URL`, `OPENAI_MODEL` — OpenAI config
- `HTTP_TIMEOUT` — client timeout (default 30000 ms)
- `NEXT_PUBLIC_PRIVY_APP_ID` — Privy auth
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — analytics

## External services

- **`@web3insight/api`** — data, auth (Privy-only since Phase D), donate, rank,
  total, repo, admin, custom, github
- **OSS Insight** — GitHub analytics (queried directly from some routes)
- **OpenAI** — AI-powered analysis with streaming via Vercel AI SDK

## Known issues

- `pnpm typecheck` uses `|| true` to swallow third-party HeroUI / React 19
  type errors. Re-enable strict mode once HeroUI ships React 19-compatible types.
- `ignoreBuildErrors: true` in `next.config.ts` — same reason.
- A handful of REST-shaped Next.js Route Handlers under `/src/app/api/` proxy
  to the backend even though equivalent oRPC procedures exist. Migration to
  direct oRPC calls is incremental.

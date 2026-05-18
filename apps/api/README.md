# @web3insight/api

Web3Insight backend — **Hono + oRPC + Drizzle + PostgreSQL**, deployed as Vercel Build Output API functions plus Inngest workflows for durable sync jobs.

See the root [`CLAUDE.md`](../../CLAUDE.md) for monorepo-wide architecture, the API surface (47 oRPC procedures across 8 sub-contracts), and deployment details. See [`AGENTS.md`](./AGENTS.md) for SQL / Drizzle conventions and the `data.*` schema rules.

## Layout

```
apps/api/
├── src/
│   ├── app/                  Hono app factory, container, middleware, docs
│   ├── rpc-hono/             oRPC handlers (admin, auth, custom, donate, github, rank, repo, total)
│   ├── services/             Pure-class business logic (auth, github, cache, …)
│   ├── inngest/              Durable workflows + Inngest client
│   ├── serverless/           Vercel function entries (api-hono.ts, cron-cache-clear.ts)
│   ├── db/                   Drizzle client, schema/, helpers, int8 custom type
│   ├── api/dto/              Legacy DTOs (class-validator — kept until cleanup)
│   ├── ai/                   AI-assisted SQL / summarisation helpers
│   ├── config/               Env loading
│   └── data/                 Static datasets used by services
├── scripts/
│   └── bundle-functions.ts   esbuild bundler → .vercel/output/functions/*
├── migrations/               PostgreSQL migrations
├── doc/                      OpenAPI spec snapshots
├── deploy/                   Legacy self-hosted Docker deploy assets
└── vercel.json               Build Output API + cron schedule
```

## Scripts

```bash
pnpm build       # bundle src/serverless/* into .vercel/output/functions/
pnpm typecheck
pnpm lint
pnpm test        # vitest
pnpm test:watch
pnpm db:pull     # drizzle-kit introspect → ./drizzle/ (rerun when upstream schema changes)
pnpm db:check    # drizzle-kit consistency check
```

There is intentionally no `start` / `dev` script — local dev uses `vercel dev` (run alongside `npx inngest-cli dev` if you also need Inngest). See the inline comment in `src/inngest/client.ts`.

## Environment

Required env vars are declared in the root `turbo.json` `globalEnv` block. See `.env.example` (if present) or the root [`CLAUDE.md`](../../CLAUDE.md) for the full list per app.

## License

See [`apps/dashboard/LICENSE`](../dashboard/LICENSE).

# Web3Insight

Web3 developer analytics platform — Turborepo + pnpm monorepo.

## Apps

| App | Description | Port | Deploy |
|---|---|---|---|
| `apps/api` | Hono + oRPC + Kysely backend (Vercel Build Output API, Inngest workflows) | 3010 | Vercel |
| `apps/dashboard` | Main analytics frontend (Next.js 16 + Turbopack) | 3000 | Vercel |
| `apps/web` | Profile / landing site (Next.js 16) | 3001 | Vercel |
| `apps/dev-card` | Developer card generator (Next.js 16, Privy) | 3002 | Vercel |

> Production traffic on `dash.web3insight.ai` is still served from the legacy self-hosted Docker stack via Cloudflare Tunnel. Vercel deployments live under `dev.web3insight.ai` until the DNS cutover.

## Quick start

```bash
nvm use                # Node 22
pnpm install
pnpm dev               # start all 4 apps in parallel
# OR:
pnpm dev:dashboard     # individual
pnpm dev:api           # Hono on http://localhost:3010
```

Common scripts:

```bash
pnpm build             # turbo build (cached)
pnpm lint              # eslint
pnpm typecheck         # tsc
pnpm test              # vitest
pnpm test:e2e          # playwright

pnpm syncpack:lint     # workspace dependency hygiene
pnpm syncpack:fix
```

## Architecture

See [CLAUDE.md](./CLAUDE.md) for the full architecture, oRPC contract, deployment, and skills documentation.

```
.
├── apps/
│   ├── api/                Hono + oRPC + Kysely (Vercel Build Output + Inngest)
│   ├── dashboard/          Next.js 16 (main analytics UI)
│   ├── web/                Next.js 16 (profile / landing)
│   └── dev-card/           Next.js 16 + Privy (card generator)
├── packages/
│   ├── api-contract/       oRPC contracts — single source of truth (8 routers, 47 procs)
│   ├── orpc-client/        Typed RPC client factory + TanStack Query
│   ├── env-base/           Shared @t3-oss/env-nextjs schema fragments
│   ├── query-keys/         TanStack Query key factory + cache presets
│   └── auth-privy/         Privy provider + JWT exchange hook
├── config/
│   ├── typescript-config/  Base tsconfig presets
│   ├── eslint-config/      Flat ESLint configs
│   ├── next-config/        createNextConfig() factory
│   └── tailwind-config/    Tailwind v4 preset + PostCSS
└── .claude/skills/         Project skills (mirrored to .agents/skills/)
```

All three frontends consume the API through end-to-end typed oRPC procedures (`createWeb3InsightClient`). No REST is wired from the frontends — `/v1/*` and `/v2/*` only exist as an external-consumer compatibility shim on the API.

## Skills

This repo uses [`npx skills`](https://github.com/anthropics/skills) for per-project agent skills. The same set is mirrored under `.claude/skills/` (Claude Code) and `.agents/skills/` (other agents). `skills-lock.json` is the source of truth.

Restore on a fresh checkout:

```bash
npx skills experimental_install
```

Add a skill:

```bash
npx skills add <owner/repo> -a claude-code -a universal -s <skill-name> -y --copy
```

See the [Skills section in CLAUDE.md](./CLAUDE.md#skills-system) for the current 43-skill catalog grouped by category.

## History

This monorepo was consolidated in May 2026 from 4 previously independent repos:

- `web3insight-ai/web3insight-api` → `apps/api`
- `web3insight-ai/web3insight.ai` → `apps/web`
- `web3insight-ai/web3insight-dev-card` → `apps/dev-card`
- `web3insight-ai/web3insight` (dashboard) → `apps/dashboard`

Backup tags `pre-monorepo-2026-05-17` exist on all 4 original repos, which retain the pre-merge history.

The API itself was migrated off NestJS to Hono + oRPC during the same window, with the L5 NestJS purge clearing the last runtime references.

## License

See [apps/dashboard/LICENSE](./apps/dashboard/LICENSE).

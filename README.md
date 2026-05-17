# Web3Insight

Web3 developer analytics platform — Turborepo + pnpm monorepo.

## Apps

| App | Description | Port | Deploy |
|---|---|---|---|
| `apps/api` | NestJS backend, PostgreSQL via Kysely | 3010 | Vercel + Railway (workers) |
| `apps/dashboard` | Main analytics frontend (Next.js 16) | 3000 | Vercel |
| `apps/web` | Profile / landing site (Next.js 16) | 3001 | Vercel |
| `apps/dev-card` | Developer card generator (Next.js 16, Privy) | 3002 | Vercel |

## Quick start

```bash
nvm use                # Node 22
pnpm install
pnpm dev               # start all 4 apps in parallel
# OR:
pnpm dev:dashboard     # individual
```

## Architecture

See [CLAUDE.md](./CLAUDE.md) for full architecture + workspace + oRPC migration guide.

```
.
├── apps/
│   ├── api/                NestJS + oRPC adapter
│   ├── dashboard/          Next.js (main)
│   ├── web/                Next.js (profile/landing)
│   └── dev-card/           Next.js + Privy
├── packages/
│   ├── api-contract/       oRPC contracts (single source of truth)
│   ├── orpc-client/        Typed RPC client + TanStack Query
│   ├── env-base/           Shared env validation
│   ├── query-keys/         TanStack Query helpers
│   └── auth-privy/         Privy provider + JWT exchange
└── config/
    ├── typescript-config/  Base tsconfig presets
    ├── eslint-config/      Flat ESLint configs
    ├── next-config/        createNextConfig() factory
    └── tailwind-config/    Tailwind v4 preset + PostCSS
```

## History

Merged from 4 previously independent repos (preserved via `git subtree`):

- `web3insight-ai/web3insight-api` → `apps/api`
- `web3insight-ai/web3insight.ai` → `apps/web`
- `web3insight-ai/web3insight-dev-card` → `apps/dev-card`
- `web3insight-ai/web3insight` (dashboard) → `apps/dashboard`

Backup tags: `pre-monorepo-2026-05-17` exist on all 4 original repos.

## License

See [apps/dashboard/LICENSE](./apps/dashboard/LICENSE).

# Dev Card App Guide

Scope: `apps/dev-card/**`. Inherit the root guide; this file covers dev-card-specific rules.

## Surface

- Package: `@web3insight/dev-card`
- Production: `https://card.web3insight.ai`, Vercel project `web3insight-dev-card`.
- Local: `pnpm dev:dev-card`, port `3002`.
- Stack: Next.js 16, React 19, Privy, oRPC BFF, TanStack Query, React Hook Form, Zod, Tailwind 4, Framer Motion.

## Commands

```bash
pnpm dev:dev-card
pnpm --filter @web3insight/dev-card lint
pnpm --filter @web3insight/dev-card typecheck
pnpm --filter @web3insight/dev-card build
```

Production build intentionally uses webpack (`next build --webpack`) until oRPC/Turbopack build compatibility is resolved.

## Code Map

```text
app/api/rpc/                         # local oRPC BFF endpoint
app/api/og/[ecosystem]/[user_id]/    # OG image generation
app/{mantle,monad,openbuild}/        # ecosystem routes
src/orpc/                            # BFF router, backend client, context
src/providers/                       # Privy, auth sync, query provider
src/hooks/useAuth.ts                 # unified auth state
src/forms/                           # card creation form and form hook
src/schemas/                         # auth/profile/form Zod schemas
src/components/                      # card faces, share/create/mint components
```

## Product Rules

- Privy handles identity; backend JWT lives in HTTP-only `auth-token` after `PrivyAuthSync` exchanges the Privy identity token via `auth.privyTokenAuth`.
- Local BFF procedures in `src/orpc/router.ts` compose upstream `@web3insight/api` oRPC calls. Do not hardcode legacy REST URLs for in-repo flows.
- Keep ecosystem route structure parallel across Mantle, Monad, and OpenBuild.
- Theme constants must stay consistent with card components and form choices.
- Do not read or print `.env.local`; use `src/env.ts`, examples, or Vercel env metadata.

## Debugging

For card/auth bugs inspect browser network + cookies first, then BFF `/api/rpc`, then upstream `web3insight-api` `/rpc` runtime logs. Missing cookies usually means auth sync/BFF behavior, not card rendering.

## Verification

- Form/profile changes: typecheck, build, and browser smoke through create-card flow.
- Auth changes: verify Privy identity-token exchange and `auth-token` cookie behavior.
- Visual card changes: browser screenshot/smoke for each touched ecosystem route.

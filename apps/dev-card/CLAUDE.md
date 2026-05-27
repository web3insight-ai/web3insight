# CLAUDE.md

Project-scoped guidance for `apps/dev-card` (`@web3insight/dev-card`).
For monorepo-wide conventions see `../../CLAUDE.md`.

## Project overview

Web3Insight Dev Card — Next.js 16 application that generates developer
profile cards for Web3 ecosystems (Mantle, Monad). Uses Privy for auth and
talks to `@web3insight/api` (Hono + oRPC) via the shared
`@web3insight/api-contract` and `@web3insight/orpc-client`.

**Production URL:** https://card.web3insight.ai — served by the
`web3insight-dev-card` Vercel project (production branch `main`). The
legacy Docker stack was decommissioned on 2026-05-27; see root CLAUDE.md
"Production routing" for the full Vercel topology.

## Essential commands

```bash
pnpm dev:dev-card                           # local dev on :3002 (Turbopack)
pnpm --filter @web3insight/dev-card build   # production build (webpack — see below)
pnpm --filter @web3insight/dev-card lint
```

Production build uses webpack (`next build --webpack`) due to an oRPC +
Turbopack compatibility issue. Dev still runs on Turbopack.

## Architecture

### Tech Stack
- **Framework:** Next.js 16 App Router with React 19
- **Auth:** Privy (@privy-io/react-auth)
- **API Layer:** oRPC with TanStack Query
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Radix UI primitives

### Directory Structure

```
app/
├── api/rpc/              # oRPC API endpoint
├── api/og/[ecosystem]/[user_id]/  # OG image generation
├── mantle/               # Mantle ecosystem routes
│   ├── page.tsx          # Landing/auth page
│   ├── create/page.tsx   # Card creation form
│   └── [user_id]/        # Individual card display
│       ├── page.tsx
│       └── layout.tsx    # Dynamic OG metadata
├── monad/                # Monad ecosystem (same structure)
└── layout.tsx            # Root layout with providers

src/
├── orpc/                 # oRPC setup
│   ├── router.ts         # API procedures (auth, github, twitter)
│   ├── client.ts         # oRPC client with TanStack Query
│   └── context.ts        # Request context
├── schemas/
│   ├── auth.schema.ts    # API schemas (apiUserSchema, updateProfileDataSchema)
│   └── form.schema.ts    # Form validation schemas
├── forms/
│   ├── DevCardForm.tsx   # Main card creation form
│   └── hooks/useDevCardForm.ts  # Form logic and state
├── hooks/
│   └── useAuth.ts        # Auth hook (wraps Privy + backend)
├── providers/
│   ├── PrivyProvider.tsx # Privy auth provider
│   ├── PrivyAuthSync.tsx # Syncs Privy with backend
│   └── QueryProvider.tsx # TanStack Query provider
└── components/
    ├── MantleCardFront.tsx / MantleCardBack.tsx
    ├── MonadCardFront.tsx / MonadCardBack.tsx
    ├── ShareButton.tsx   # Social sharing
    ├── CreateCardButton.tsx  # Links to create page
    └── MintNFTButton.tsx # NFT minting (coming soon)
```

### Key Patterns

**oRPC API layer (BFF):**
- Local BFF procedures defined in `src/orpc/router.ts` exposed at `/api/rpc`.
- These compose calls to the upstream `@web3insight/api` via the typed
  client in `src/orpc/backend.ts`, then return shapes tailored to the card
  UI (auth, github, twitter procedures).
- Protected procedures require the `auth-token` HTTP-only cookie.

**Authentication flow:**
1. Privy handles OAuth (GitHub, Google, wallet).
2. `PrivyAuthSync` calls the BFF `auth.signInWithPrivy` procedure, which
   exchanges the Privy identity token for a backend JWT via
   `@web3insight/api` `auth.privyTokenAuth`.
3. Backend JWT is stored in the HTTP-only `auth-token` cookie.
4. `useAuth` hook surfaces unified auth state to components.

**Ecosystem theming:**
- Mantle: teal (`#5EEAD4`)
- Monad: purple (`#9F8EFF`)
- Theme config in `DevCardForm.tsx` and component-level.

**Form submission:**
- `useDevCardForm` manages form state and Zod validation.
- Submits via the BFF `auth.updateProfile` procedure (which calls
  `@web3insight/api` `auth.updateUserByTag` on the contract).

### Environment variables

```bash
DATA_API_URL=https://api.web3insight.ai    # @web3insight/api base URL
DATA_API_TOKEN=…                            # service token (Bearer auth)
TWITTER_API_URL=…                           # Twitter data API
NEXT_PUBLIC_PRIVY_APP_ID=…                  # Privy app id
PRIVY_APP_SECRET=…                          # Privy secret (server-only)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=…              # analytics (optional)
```

Validated in `src/env.ts` via `@t3-oss/env-nextjs` with shared fragments
from `@web3insight/env-base`.

### Upstream contract procedures used

Through the typed `@web3insight/api-contract` client (no hardcoded REST URLs):

- `auth.privyTokenAuth` — exchange Privy identity token for backend JWT
- `auth.me` / `auth.publicById` / `auth.getUserByTagAndId` — user lookup
- `auth.updateUserByTag` — write profile
- `github.*` — Github helpers

The legacy `/v1/*` and `/v2/*` REST paths still exist on the backend as an
OpenAPIHandler compatibility shim for external consumers, but in-repo
callers always use the oRPC client.

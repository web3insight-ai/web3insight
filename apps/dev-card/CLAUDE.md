# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3Insight Dev Card is a Next.js 16 application for generating developer profile cards for Web3 ecosystems (Mantle and Monad). It uses Privy for authentication and integrates with the Web3Insight API.

**Production URL:** https://card.web3insight.ai

## Essential Commands

```bash
pnpm dev          # Development server with Turbopack
pnpm build        # Production build (uses webpack)
pnpm lint         # ESLint
pnpm start        # Start production server
```

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

**oRPC API Layer:**
- Procedures defined in `src/orpc/router.ts`
- Protected procedures require auth token from HTTP-only cookie
- Client in `src/orpc/client.ts` integrates with TanStack Query
- API endpoint at `/api/rpc`

**Authentication Flow:**
1. Privy handles OAuth (GitHub, Google, wallet)
2. `PrivyAuthSync` exchanges Privy token for backend JWT
3. Backend token stored in HTTP-only cookie (`auth-token`)
4. `useAuth` hook provides unified auth state

**Ecosystem Theming:**
- Mantle: teal (`#5EEAD4`)
- Monad: purple (`#9F8EFF`)
- Theme config in `DevCardForm.tsx` and component-level

**Form Submission:**
- `useDevCardForm` manages form state and validation
- Submits to `orpc.auth.updateProfile`
- Profile data sent to `/v2/auth/user/info/{ecosystem}`

### Environment Variables

```bash
DATA_API_URL=https://api.web3insight.ai    # Backend API
TWITTER_API_URL=...                         # Twitter data API
NEXT_PUBLIC_PRIVY_APP_ID=...               # Privy app ID
PRIVY_APP_SECRET=...                       # Privy secret
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...           # Analytics (optional)
```

Environment validation in `src/env.ts` with Zod schemas.

### API Endpoints Used

- `POST /v1/auth/privy/token/auth` - Exchange Privy token
- `GET /v1/auth/user` - Get current user
- `GET /v2/auth/user/info/{ecosystem}/{id}` - Get user by ecosystem
- `POST /v2/auth/user/info/{ecosystem}` - Update profile
- `GET /v2/external/github/users/username/{username}` - GitHub data

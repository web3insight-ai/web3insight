# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3Insight is a Web3 developer analytics platform. Part of a pnpm workspace with:
- **web3insight-api** (NestJS backend at `../web3insight-api/`)
- **web3insight** (this Next.js 16 frontend)

## Essential Commands

```bash
pnpm dev              # Development with Turbopack (auto-runs env setup)
pnpm build            # Production build (uses webpack)
pnpm lint             # ESLint
pnpm typecheck        # TypeScript check (uses || true for third-party type errors)
```

**Pre-commit hooks** enforce: 2-space indent, semicolons, Prettier formatting.

## Architecture

Next.js 16 App Router with Domain-Driven Design in `/src/`:

### `/src/app/` - Routes & API
- `page.tsx` / `layout.tsx` - Routes and layouts
- `api/` - Next.js API routes (proxy to backend)
- `atoms.ts` - Jotai global state atoms

### `/src/services/` - Domain Modules
Each domain follows this structure:
```
domain/
├── typing.ts        # Type definitions
├── repository.ts    # Data access (API calls)
├── helper.ts        # Business logic
├── views/           # Page components
├── widgets/         # Reusable UI components
└── hooks/           # Domain-specific hooks (optional)
```

**Current domains**: admin, ai, auth, developer, ecosystem, event, github, profile-analysis, repository

### `/src/lib/` - Shared Infrastructure
- `api/client.ts` - Centralized API client with typed endpoints
- `api/types.ts` - Shared API response types
- `query/keys.ts` - TanStack Query key factory
- `form/components.tsx` - React Hook Form + NextUI form components

### `/src/hooks/api/` - Data Fetching Hooks
TanStack Query hooks with query options pattern:
```typescript
// Hook definition pattern
export const ecosystemQueryOptions = {
  list: () => queryOptions({
    queryKey: queryKeys.ecosystems.list(),
    queryFn: async () => { /* fetch */ },
    staleTime: 5 * 60 * 1000,
  }),
};

export function useEcosystemList() {
  return useQuery(ecosystemQueryOptions.list());
}

export function useSuspenseEcosystemList() {
  return useSuspenseQuery(ecosystemQueryOptions.list());
}
```

### `/src/components/` - Shared UI
- `controls/` - Complex reusable components
- `loading/` - Skeleton components
- `widgets/` - Specialized UI components

## Path Aliases

```
@env  → ./src/env.ts
@/*   → ./src/*
~/*   → ./src/services/*
#/*   → ./src/app/*
$/*   → ./src/components/*
```

## Key Patterns

### Data Fetching with TanStack Query
Client components use hooks from `/src/hooks/api/`:
```typescript
'use client';
import { useDeveloperList } from '@/hooks/api/useDeveloper';

function Component() {
  const { data, isLoading } = useDeveloperList();
}
```

### Forms with React Hook Form + Zod
```typescript
'use client';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormSelect } from '@/lib/form/components';

const schema = z.object({ name: z.string().min(1) });

function Form() {
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

### API Response Types
All API responses follow `ResponseResult<T>` from `/src/lib/api/types.ts`:
```typescript
interface ResponseResult<T> {
  success: boolean;
  data: T;
  message: string;
  code: string;
}
```

### Server vs Client Components
- Default: Server Components (no directive)
- Use `"use client"` only for: hooks, browser APIs, event handlers, TanStack Query

## Environment Variables

Validated via `@t3-oss/env-nextjs` in `/src/env.ts`:

**Required**:
- `DATA_API_URL` - Backend API URL
- `DATA_API_TOKEN` - API auth token
- `OPENAI_API_KEY` - OpenAI API key

**Optional**:
- `OSSINSIGHT_URL` - OSS Insight API
- `OPENAI_BASE_URL`, `OPENAI_MODEL` - OpenAI config
- `HTTP_TIMEOUT` - Client timeout (default: 30000ms)
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy auth
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` - Analytics

## External Services

- **Backend API** (web3insight-api): Data, auth, GitHub OAuth
- **OSS Insight**: GitHub analytics
- **OpenAI**: AI-powered analysis with streaming

## Known Issues

- `pnpm typecheck` uses `|| true` due to third-party library type errors
- `ignoreBuildErrors: true` temporarily enabled in next.config.ts

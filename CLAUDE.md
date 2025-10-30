# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3Insight is a comprehensive analytics platform for Web3 ecosystems, repositories, and developers. Built with Next.js 15 (App Router), React Server Components, and TypeScript, it integrates multiple data sources to provide insights into blockchain development activity.

This is part of a larger pnpm workspace project (Web3Insight AI) that includes:
- **sakuin** - NestJS backend API server (../sakuin/)
- **web3insight** - This Next.js 15 frontend application (current)
- **web3insight-profile** - Next.js 15 profile analysis application (../web3insight-profile/)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React Server Components, TypeScript
- **Styling**: Tailwind CSS, NextUI components
- **State Management**: Jotai (atomic state management)
- **Build Tool**: Next.js with Turbopack (dev mode)
- **Package Manager**: pnpm (v9.4.0)
- **Node Version**: >=20.0.0
- **Backend Integration**: Custom REST API (DATA_API_URL)
- **Data Sources**: OpenDigger, OSS Insight, RSS3, GitHub API
- **AI**: OpenAI and Azure OpenAI integrations with streaming support
- **Web3**: RainbowKit + Wagmi for wallet connections

## Essential Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack (auto-runs env setup)
pnpm run env          # Generate environment configuration

# Code Quality
pnpm lint             # Run Next.js linting with ESLint
pnpm typecheck        # Run TypeScript type checking

# Production
pnpm build            # Build for production with Next.js
pnpm start            # Start production server
```

**Important**: The project uses pre-commit hooks with lint-staged that enforce linting on staged files:
- 2-space indentation required
- Semicolons required
- Prettier formatting applied automatically
- ESLint fixes applied automatically

## Architecture Overview

This is a **Next.js 15 App Router application** following a Domain-Driven Design (DDD) approach with all code in the `/src/` directory:

### `/src/app/` - Next.js App Router
- **File-based routing**: Following Next.js 15 conventions
- **Server Components**: Default server-side rendering with RSC
- **Client Components**: Marked with `"use client"` directive for interactivity
- **API Routes**: RESTful endpoints in `/src/app/api/` structure
- **Layouts**: Nested layouts with `layout.tsx` files
- **Global styles**: `globals.css` for Tailwind CSS
- **Atoms**: Jotai atoms defined in `atoms.ts`

### `/src/services/` - Business Logic (Domain Layer)
Domain-Driven Design with each module containing:
- `typing.ts` - TypeScript type definitions
- `repository.ts` or `repository/` - Data access layer with API clients
- `helper.ts` or `helper/` - Domain-specific utility functions
- `views/` - Page-level UI components
- `widgets/` - Domain-specific reusable UI components

**Current Domains**:
- `admin/` - Administrative features
- `ai/` - AI-powered analysis services
- `api/` - Main backend API integration
- `auth/` - Authentication management
- `developer/` - Developer analytics and ranking
- `ecosystem/` - Web3 ecosystem analysis
- `event/` - Event tracking and management
- `github/` - GitHub API integration
- `opendigger/` - OpenDigger API integration
- `origin/` - Origin protocol integration
- `ossinsight/` - OSS Insight API integration
- `profile-analysis/` - Developer profile analysis
- `repository/` - Repository metrics and insights
- `statistics/` - Statistical analysis features

### `/src/components/` - Shared UI Components
Reusable components used across domains:
- **Controls**: Complex reusable components (brand-logo, chart-card, data-table, metric-card, etc.)
- **Loading**: Skeleton components for loading states
- **Widgets**: Specialized UI components for specific use cases

### `/src/` - Other Shared Resources
- `clients/` - Configured HTTP and Redis clients
- `types/` - Shared TypeScript type definitions
- `utils/` - Utility functions and helpers
- `config/` - Configuration files
- `providers/` - React context providers
- `hooks/` - Custom React hooks
- `env.ts` - Environment variable configuration with validation

## Path Aliases

The project uses these TypeScript path aliases (defined in `tsconfig.json`):
- `@env` → `./src/env.ts` (environment configuration)
- `@/*` → `./src/*` (all source files)
- `~/*` → `./src/services/*` (domain modules)
- `#/*` → `./src/app/*` (Next.js App Router)
- `$/*` → `./src/components/*` (shared components)

## Key Development Patterns

### 1. Next.js App Router Structure
- **Page Components**: `page.tsx` files define routes
- **Layout Components**: `layout.tsx` files define nested layouts
- **API Routes**: `route.ts` files in `/src/app/api/` structure
- **Dynamic Routes**: `[param]/page.tsx` for dynamic segments
- **Server Components**: Default rendering mode (no directive needed)
- **Client Components**: Require `"use client"` directive

### 2. Data Fetching Patterns

**Server Components** (preferred for initial data):
```typescript
// Server Component - runs on server, can directly call async functions
export default async function Page() {
  const data = await fetchDataFromAPI();
  return <Component data={data} />;
}
```

**Repository Pattern** (maintained from original architecture):
```typescript
// Always returns ResponseResult<T> from API
async function fetchOne(id: string): Promise<ResponseResult<Entity>> {
  const response = await apiClient.get(`/entity/${id}`);
  return response.data;
}
```

### 3. Component Architecture
- **Server Components**: Default for pages and static content (better performance)
- **Client Components**: Use `"use client"` for interactivity, hooks, browser APIs
- **Views**: Page-level components in `/src/services/*/views/`
- **Widgets**: Domain-specific reusable components in `/src/services/*/widgets/`
- **Shared Components**: Cross-domain components in `/src/components/`

### 4. State Management with Jotai
Client-side state using Jotai atoms (requires client components):
```typescript
'use client';
import { atom, useAtom } from 'jotai';

// Define atoms in src/app/atoms.ts or domain-specific files
export const userAtom = atom<User | null>(null);

// Usage in client components
const [user, setUser] = useAtom(userAtom);
```

### 5. HTTP Client Usage
Each external API has its own configured client in the domain's `repository/` or `repository.ts`:
- **Main API**: `/src/services/api/repository/client.ts` (uses DATA_API_URL)
- **GitHub**: `/src/services/github/repository/client.ts`
- **OpenDigger**: `/src/services/opendigger/repository/client.ts`
- **OSS Insight**: `/src/services/ossinsight/repository/client.ts`
- **AI Services**: `/src/services/ai/repository/` (OpenAI/Azure OpenAI)

All clients return consistent `ResponseResult<T>` types for error handling.

## Important Conventions

1. **TypeScript**: Strict mode enabled. All code must be properly typed.
2. **Linting**: 2-space indentation, semicolons required, ESLint rules enforced via pre-commit hooks.
3. **Components**: Use function components with TypeScript. Props must be typed with interfaces or types.
4. **Client Components**: Add `"use client"` directive ONLY when using hooks, browser APIs, or event handlers.
5. **Imports**: Use path aliases (@/, ~/, #/, $/) for cleaner imports.
6. **Async Operations**: Handle errors properly and return consistent ResponseResult types.
7. **Environment Variables**:
   - Server-side: Access via `env` from `@env` (validated with Zod)
   - Client-side: Must be prefixed with `NEXT_PUBLIC_`

## Adding New Features

When adding a new feature:
1. **Create domain module** in `/src/services/` if it's a major feature area
2. **Follow DDD structure**:
   - `typing.ts` - Define types
   - `repository.ts` or `repository/` - Data access layer
   - `helper.ts` or `helper/` - Business logic
   - `views/` - Page-level components
   - `widgets/` - Reusable components
3. **Add routes** in `/src/app/` following Next.js App Router conventions
4. **Use Server Components by default**, Client Components only for interactivity
5. **Reuse existing UI components** from NextUI and shared components
6. **Integrate with existing HTTP clients** for API calls
7. **Maintain type safety** throughout the feature
8. **Consider AI streaming patterns** for data-intensive features

## External Service Integration

The project integrates with multiple external services:
- **Custom Backend API** (sakuin): Primary backend for content, data, and authentication
- **OpenDigger**: Open source project metrics
- **OSS Insight**: GitHub analytics data
- **RSS3**: Web3 social and activity data (via rss3 service)
- **GitHub API**: Direct repository and user data
- **OpenAI/Azure OpenAI**: AI-powered analysis with streaming support

All external service integrations follow the repository pattern in their respective domain modules.

## Performance Considerations

1. **Server Components**: Leverage RSC for initial page loads (zero JS shipped to client)
2. **Client Components**: Use `"use client"` sparingly - only when necessary
3. **Streaming**: Utilize Next.js streaming with Suspense for progressive rendering
4. **Loading States**: Implement `loading.tsx` files and skeleton components
5. **Parallel Fetching**: Use `Promise.all()` in Server Components for parallel data fetching
6. **Code Splitting**: Next.js automatic code splitting reduces bundle sizes
7. **AI Streaming**: Server-Sent Events for real-time AI response streaming

## Build Configuration

- **Next.js Config**: Custom webpack config with server/client externals (`next.config.ts`)
- **TypeScript**: Strict mode with `ignoreBuildErrors: true` temporarily during migration
- **ESLint**: Custom configuration (`.eslintrc.cjs`) with React, TypeScript, and a11y rules
- **Tailwind**: Custom configuration with NextUI integration
- **Images**: Remote patterns configured for GitHub avatars and github.com
- **Environment**: Validated via `@t3-oss/env-nextjs` with Zod schemas in `/src/env.ts`

## Environment Configuration

Environment variables are validated using `@t3-oss/env-nextjs` in `/src/env.ts`:

**Required Server Variables**:
- `DATA_API_URL` - Main backend API URL
- `DATA_API_TOKEN` - API authentication token
- `OPENDIGGER_URL` - OpenDigger API URL
- `OSSINSIGHT_URL` - OSS Insight API URL
- `SESSION_SECRET` - Session encryption secret

**Optional Server Variables**:
- `OPENAI_BASE_URL`, `OPENAI_API_KEY` - OpenAI configuration
- `AI_API_URL`, `AI_API_TOKEN` - Alternative AI service
- `HTTP_TIMEOUT` - HTTP client timeout (default: 30000ms)

**Required Client Variables** (prefixed with `NEXT_PUBLIC_`):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect configuration
- `NEXT_PUBLIC_GITHUB_CLIENT_ID` - GitHub OAuth configuration

The `predev` script automatically runs environment setup before starting development.

## Known Issues & Migration Status

**TypeScript Errors**: The `pnpm typecheck` command includes `|| true` to prevent CI/CD failures from third-party library type errors (particularly `petals-ui`).

**Build Configuration**: `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` are temporarily enabled during ongoing migration validation.

**Migration History**:
1. Migrated from Remix to Next.js 15 (complete)
2. All functionality preserved with Next.js App Router

## Development Notes

- **Framework**: Next.js 15 with App Router (file-based routing)
- **Server Components**: Default rendering mode for better performance
- **Client Components**: Use `"use client"` directive when needed
- **API Routes**: Use `/src/app/api/` structure for backend endpoints
- **Streaming**: AI responses use Server-Sent Events for real-time updates
- **Testing**: No test framework currently configured
- **Git Hooks**: Husky with lint-staged for pre-commit validation
- **Authentication**: GitHub OAuth through custom backend API (sakuin)
- **Admin Features**: Role-based access control via backend API
- **Workspace Context**: Part of larger pnpm workspace - coordinate changes with sibling applications

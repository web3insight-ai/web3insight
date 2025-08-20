# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3Insight is a comprehensive analytics platform for Web3 ecosystems, repositories, and developers. It's built with Next.js 15 (App Router), React Server Components, TypeScript, and integrates multiple data sources to provide insights into blockchain development activity.

This is part of a larger pnpm workspace project (Web3Insight AI) that includes three applications:
- **sakuin** - NestJS backend API server (../sakuin/)  
- **web3insight** - This Next.js 15 frontend application
- **web3insight-profile** - Next.js 15 application for AI-powered developer profiles

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, NextUI components
- **State Management**: Jotai (atomic state)
- **Build Tool**: Next.js with Turbopack (dev)
- **Package Manager**: pnpm (v9.4.0)
- **Node Version**: >=20.0.0
- **Backend**: Custom REST API (DATA_API_URL)
- **Data Sources**: OpenDigger, OSS Insight, RSS3, GitHub API
- **AI**: OpenAI and Azure OpenAI integrations with streaming support
- **Web3**: RainbowKit + Wagmi for wallet connections

## Essential Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm run env          # Generate environment configuration (runs automatically before dev)

# Code Quality
pnpm lint             # Run Next.js linting with ESLint
pnpm typecheck        # Run TypeScript type checking

# Production
pnpm build            # Build for production with Next.js
pnpm start            # Start production server
```

**Important**: Always run `pnpm lint` and `pnpm typecheck` after making changes. The project uses pre-commit hooks with lint-staged that enforce linting on staged TypeScript files (2-space indentation, semicolons required).

## Architecture Overview

This is a **Next.js 15 App Router application** that was recently migrated from Remix and underwent a complete directory restructure to eliminate the `/src` directory. The architecture follows Next.js best practices with a Domain-Driven Design approach:

### 1. `/app/` - Next.js App Router
- **File-based routing**: Following Next.js App Router conventions
- **Server Components**: Default server-side rendering with RSC
- **Client Components**: Marked with `"use client"` for interactivity
- **API Routes**: RESTful endpoints in `/app/api/` structure
- **Layouts**: Nested layouts with `layout.tsx` files
- **Global styles**: `globals.css` for Tailwind CSS

### 2. `/lib/services/` - Business Logic (Domain Layer)
Each domain module (e.g., developer, ecosystem, repository, admin, ai, auth, event, profile-analysis) contains:
- `typing.ts` - TypeScript type definitions
- `repository.ts` or `repository/` - Data access layer
- `helper.ts` or `helper/` - Utility functions
- `views/` - UI components for pages
- `widgets/` - Reusable UI components

### 3. `/components/` - Shared UI Components
- **Shared Components**: Reusable UI components used across the application
- **Controls**: Complex reusable components (brand-logo, chart-card, data-table, metric-card, etc.)
- **Loading**: Skeleton components for loading states
- **Widgets**: Specialized UI components for specific use cases

### 4. `/lib/` - Shared Resources
- `clients/` - HTTP and Redis clients
- `types/` - Shared TypeScript types
- `utils/` - Utility functions
- `config/` - Configuration files
- `providers/` - React context providers

## Path Aliases

The project uses these TypeScript path aliases:
- `@/*` → `./lib/*` (shared resources)
- `~/*` → `./lib/services/*` (domain modules)
- `#/*` → `./app/*` (Next.js App Router)
- `$/*` → `./components/*` (shared components)

## Key Development Patterns

### 1. Next.js App Router Structure
- **Page Components**: `page.tsx` files define routes
- **Layout Components**: `layout.tsx` files define nested layouts  
- **API Routes**: `route.ts` files in `/app/api/` structure
- **Dynamic Routes**: `[param]/page.tsx` for dynamic segments
- **Server Components**: Default rendering mode for pages
- **Client Components**: Use `"use client"` directive for interactivity

### 2. Data Fetching Patterns
**Server Components** (preferred for initial data):
```typescript
// Server Component - runs on server
export default async function Page() {
  const data = await fetchData(); // Direct async calls
  return <Component data={data} />;
}
```

**Repository Pattern** (maintained from original architecture):
```typescript
// Always returns ResponseResult<T>
async function fetchOne(id: string): Promise<ResponseResult<Entity>> {
  // Implementation
}
```

### 3. Component Architecture
- **Server Components**: Default for pages and static content
- **Client Components**: Interactive components with `"use client"`
- **Views**: Page-level components in `/lib/services/*/views/`
- **Widgets**: Domain-specific reusable components in `/lib/services/*/widgets/`
- **Shared**: Cross-domain components in `/components/`

### 4. State Management
Jotai atoms for client-side state (requires client components):
```typescript
'use client';
import { useAtom } from 'jotai';
// Define in app/atoms.ts or domain-specific files
export const someAtom = atom<Type>(initialValue);
```

### 5. HTTP Client Usage
Each external API has its own configured client:
- Main API: `/lib/services/api/repository/client.ts` (uses DATA_API_URL)
- GitHub: `/lib/services/github/repository/client.ts`
- OpenDigger: `/lib/services/opendigger/repository/client.ts`
- OSS Insight: `/lib/services/ossinsight/repository/client.ts`
- RSS3: `/lib/services/rss3/repository/client.ts`
- AI Services: `/lib/services/ai/repository/` (OpenAI/Azure OpenAI)

## Important Conventions

1. **TypeScript**: Strict mode is enabled. All code must be properly typed.
2. **Linting**: Code must pass ESLint checks. Uses 2-space indentation and requires semicolons.
3. **Components**: Use function components with TypeScript. Props must be typed.
4. **Client Components**: Add `"use client"` directive for interactive components.
5. **Imports**: Use path aliases (@/, ~/, #/, $/) for cleaner imports.
6. **Async Operations**: Handle errors properly and return consistent ResponseResult types.
7. **Environment Variables**: Access via helper functions in `/lib/utils/env.ts`.

## Adding New Features

When adding a new feature:
1. Create a new domain module in `/lib/services/` if it's a major feature
2. Follow the existing structure (typing.ts, repository.ts, helper.ts, views/, widgets/)
3. Add routes in `/app/` following Next.js App Router conventions
4. Use Server Components by default, Client Components for interactivity
5. Use existing UI components from NextUI and shared components
6. Integrate with existing HTTP clients for API calls
7. Add necessary types and maintain type safety throughout
8. Consider AI streaming patterns for data-intensive features

## External Service Integration

The project integrates with multiple services:
- **Custom Backend API**: Primary backend for content, data, and authentication (DATA_API_URL)
- **OpenDigger**: Open source project metrics
- **OSS Insight**: GitHub analytics data
- **RSS3**: Web3 social and activity data
- **GitHub API**: Direct repository and user data
- **OpenAI/Azure OpenAI**: AI-powered analysis

When working with these services, use the existing client configurations and follow the established patterns in the respective domain modules.

## Performance Considerations

1. **Server Components**: Leverage React Server Components for initial page loads
2. **Client Components**: Use `"use client"` only when necessary for interactivity
3. **Streaming**: Utilize Next.js streaming for progressive page rendering
4. **Loading States**: Implement proper loading.tsx files and skeletons
5. **Parallel Fetching**: Use Promise.all() in Server Components for parallel data fetching
6. **Code Splitting**: Next.js automatic code splitting reduces bundle sizes
7. **AI Streaming**: Server-Sent Events for real-time AI response streaming

## Build Configuration

- **Next.js Configuration**: Custom webpack config with server external packages
- **TypeScript**: Strict mode with build error ignoring during migration (`|| true` in typecheck script)
- **ESLint**: Custom configuration with React, TypeScript, and accessibility rules
- **Tailwind**: Custom configuration with NextUI integration and content paths for new directory structure
- **Images**: Remote patterns configured for GitHub avatars

## TypeScript Configuration

The project uses strict TypeScript configuration:
- `strict: true` - Enables all strict type checking options
- `skipLibCheck: true` - Skips type checking of declaration files

**Known Issue**: The `pnpm typecheck` command may show errors from third-party libraries (`@petals/basic` and `petals-ui`). The typecheck script includes `|| true` to prevent CI/CD pipeline failures from third-party library issues.

## Environment Setup

- Environment configuration is managed via `.knosys/scripts env` command
- The `predev` script automatically runs environment setup before starting development  
- Custom environment utilities are available in `/lib/utils/env.ts`
- Next.js environment variables use `NEXT_PUBLIC_` prefix for client-side access

## Migration Status

This application has undergone two major migrations:
1. **Remix to Next.js 15**: Complete framework migration maintaining functionality
2. **Directory Structure Refactor**: Eliminated `/src` directory following Next.js best practices

**Current State**: Fully functional Next.js 15 App Router application with clean directory structure

## Development Notes

- **Framework**: Next.js 15 with App Router
- **Server Components**: Default rendering mode for better performance
- **Client Components**: Use `"use client"` directive for interactive features
- **API Routes**: Use `/app/api/` structure for backend endpoints
- **Streaming**: AI responses use Server-Sent Events for real-time updates
- **Testing**: No test framework currently configured
- **Git Hooks**: Husky with lint-staged for pre-commit validation
- **Authentication**: GitHub OAuth through custom backend API
- **Admin Features**: Require special permissions
- **Workspace**: Part of larger pnpm workspace - consider impact on sibling applications
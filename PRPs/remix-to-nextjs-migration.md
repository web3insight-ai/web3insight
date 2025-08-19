# Remix to Next.js 15 Migration PRP

## Goal
Migrate the entire Web3Insight Remix.js application to Next.js 15 with App Router while preserving 100% of functionality, styling, state management, and API integrations. End state: identical user experience with Next.js performance benefits.

## Why
- **Performance improvements**: Next.js 15 App Router with React Server Components and streaming
- **Better developer experience**: Modern Next.js tooling and ecosystem
- **Future-proofing**: Stay current with React/Next.js ecosystem evolution
- **Deployment flexibility**: Better Vercel integration and deployment options
- **Bundle optimization**: Automatic code splitting and optimization

## What
Complete framework migration with zero functionality loss:

- **17 Remix routes** → Next.js App Router structure
- **Data fetching patterns** → Server Components + API routes
- **Streaming AI responses** preserved with SSE
- **Authentication flow** maintained (GitHub OAuth + JWT)
- **Web3 integrations** preserved (RainbowKit + Wagmi)
- **State management** maintained (Jotai atoms)
- **Styling** identical (Tailwind + NextUI)
- **Domain architecture** preserved (DDD structure)

### Success Criteria
- [ ] All 17 routes render identically
- [ ] AI streaming functionality works
- [ ] Authentication flow functional
- [ ] Web3 wallet connection works  
- [ ] Admin panel accessible
- [ ] Performance equal or better
- [ ] Build succeeds without errors
- [ ] TypeScript compilation clean

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app/guides/migrating/app-router-migration
  why: Official Next.js migration guide with patterns and gotchas

- url: https://nextjs.org/docs/app/getting-started/fetching-data
  why: Server Components data fetching patterns to replace Remix loaders

- url: https://blacksheepcode.com/posts/migrating_from_remix_to_next
  why: Real-world migration experience with specific code examples

- file: src/entry/routes/_home._index/route.tsx
  why: Main page loader/action pattern to convert

- file: src/entry/routes/api.ai.query.ts
  why: Streaming API route pattern critical for AI functionality

- file: src/entry/root.tsx
  why: Root layout with providers that must be preserved

- file: vite.config.ts
  why: Current build config and environment variables

- file: package.json
  why: Dependencies to preserve and scripts to update

- doc: https://nextjs.org/docs/app/api-reference/file-conventions/route
  section: Route Handlers
  critical: Streaming responses must work for AI queries

- docfile: CLAUDE.md
  why: Project-specific patterns and conventions to follow
```

### Current Codebase Tree
```bash
src/
├── domain/                 # Business logic (PRESERVE unchanged)
│   ├── admin/             # Admin functionality
│   ├── ai/                # AI query processing
│   ├── auth/              # Authentication logic
│   ├── developer/         # Developer analytics
│   ├── ecosystem/         # Ecosystem analytics
│   ├── repository/        # Repository analytics
│   └── [8 more domains]/
├── entry/                 # Remix-specific (CONVERT to app/)
│   ├── routes/            # File-based routing (17 routes)
│   ├── layouts/           # Layout components
│   ├── components/        # Shared components
│   ├── root.tsx           # Root with providers
│   └── atoms.ts           # Jotai state
└── shared/                # Utilities (PRESERVE unchanged)
    ├── clients/           # HTTP clients
    ├── components/        # Reusable components
    ├── providers/         # React providers
    └── utils/             # Helper functions
```

### Desired Codebase Tree
```bash
src/
├── app/                   # Next.js App Router (NEW)
│   ├── layout.tsx         # Root layout (from entry/root.tsx)
│   ├── page.tsx           # Home page (from _home._index/)
│   ├── loading.tsx        # Loading UI
│   ├── globals.css        # Global styles
│   ├── developers/
│   │   ├── page.tsx       # List page
│   │   └── [id]/page.tsx  # Detail page
│   ├── ecosystems/
│   │   ├── page.tsx
│   │   └── [name]/page.tsx
│   ├── repositories/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── admin/
│   │   ├── layout.tsx     # Admin layout
│   │   ├── page.tsx
│   │   └── [nested]/
│   └── api/               # API routes (from api.* routes)
│       ├── ai/query/route.ts
│       ├── auth/[action]/route.ts
│       └── [others]/route.ts
├── domain/                # Business logic (UNCHANGED)
├── shared/                # Utilities (UNCHANGED)
└── components/            # Shared UI (from entry/components)
```

### Known Gotchas of Codebase & Library Quirks
```typescript
// CRITICAL: NextUI components need "use client" directive
// NextUI components are client-side only
'use client';
import { Input, Modal } from '@nextui-org/react';

// CRITICAL: Jotai atoms work differently in Next.js
// Must use Provider in root layout for SSR compatibility
import { Provider as JotaiProvider } from 'jotai';

// CRITICAL: RainbowKit requires client-side rendering
// Wallet providers must be wrapped with ClientOnly component
<ClientOnly>
  <WalletProvider>
    {children}
  </WalletProvider>
</ClientOnly>

// CRITICAL: AI streaming uses Server-Sent Events
// Response format must match exactly for frontend parsing
return new Response(res.body, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});

// CRITICAL: Environment variables in Next.js
// Different pattern from Vite's import.meta.env
process.env.VITE_ORIGIN_CLIENT_ID // Next.js way
// vs
import.meta.env.VITE_ORIGIN_CLIENT_ID // Vite way

// CRITICAL: Path aliases must match current setup
// @/* → ./src/shared/*
// ~/* → ./src/domain/*  
// #/* → ./src/app/* (changed from entry)
```

## Implementation Blueprint

### Data Models and Structure
No new data models - this is a framework migration preserving existing domain logic.

### List of tasks to be completed to fulfill the PRP

```yaml
Task 1 - Project Setup:
CREATE new Next.js 15 project:
  - RUN: npx create-next-app@latest web3insight-nextjs --typescript --tailwind --app
  - PRESERVE: All current dependencies from package.json
  - MODIFY: tsconfig.json with exact path aliases from current project

Task 2 - Dependencies Migration:
COPY package.json dependencies:
  - EXCLUDE: @remix-run/* packages
  - INCLUDE: All NextUI, Jotai, Web3, AI packages
  - ADD: Next.js specific packages if needed
  - UPDATE: scripts for Next.js commands

Task 3 - Configuration Files:
CREATE next.config.js:
  - MIRROR: Environment variable pattern from vite.config.ts
  - PRESERVE: All VITE_* variables
  - SETUP: Proper Next.js environment handling

MODIFY tsconfig.json:
  - PRESERVE: Exact path aliases (@/*, ~/* #/*)
  - UPDATE: #/* to point to ./src/app/*
  - KEEP: All other TypeScript settings

Task 4 - Directory Structure Setup:
MOVE src/shared/ → src/shared/ (unchanged):
  - PRESERVE: All files as-is
  - NO CHANGES: Business logic stays identical

MOVE src/domain/ → src/domain/ (unchanged):
  - PRESERVE: All files as-is  
  - NO CHANGES: Business logic stays identical

CREATE src/app/ directory:
  - NEW: Next.js App Router structure
  - CONVERT: entry/ content to app/

Task 5 - Root Layout Conversion:
CREATE src/app/layout.tsx:
  - MIRROR: src/entry/root.tsx structure
  - PRESERVE: All providers (NextUI, Theme, Wallet)
  - CONVERT: Remix patterns to Next.js patterns
  - KEEP: Exact same provider configuration

Task 6 - Route Migration (Critical):
CONVERT 17 Remix routes to App Router:
  
  _home._index/ → app/page.tsx:
    - EXTRACT: loader logic to Server Component
    - PRESERVE: AI query streaming functionality  
    - CONVERT: useFetcher to fetch API calls
    - KEEP: All UI components identical

  _home.developers.$id/ → app/developers/[id]/page.tsx:
    - CONVERT: loader to generateMetadata + Server Component
    - PRESERVE: All data fetching logic
    - KEEP: Component structure identical

  api.ai.query.ts → app/api/ai/query/route.ts:
    - CRITICAL: Preserve streaming functionality
    - KEEP: Exact same response headers
    - MAINTAIN: Server-Sent Events pattern

  [Repeat for all 17 routes]

Task 7 - Component Client Directive:
IDENTIFY components needing "use client":
  - FIND: Components with useState, useEffect, useAtom
  - ADD: "use client" directive at top
  - PRESERVE: All functionality exactly

UPDATE import paths:
  - CHANGE: #/* imports to point to new app/ structure
  - KEEP: @/* and ~/* imports unchanged

Task 8 - API Routes Conversion:
CONVERT all api.* routes to app/api/ structure:
  - PRESERVE: Exact same request/response logic
  - MAINTAIN: Authentication middleware
  - KEEP: Error handling patterns
  - CRITICAL: Streaming routes must work identically

Task 9 - Environment Variables:
UPDATE environment usage:
  - FIND: import.meta.env usage
  - REPLACE: with process.env
  - PRESERVE: All variable names and values
  - TEST: All integrations still work

Task 10 - Build and Validation:
UPDATE package.json scripts:
  - REPLACE: "dev": "remix vite:dev" → "dev": "next dev"
  - REPLACE: "build": "remix vite:build" → "build": "next build"  
  - REPLACE: "start": "remix-serve" → "start": "next start"
  - KEEP: lint and typecheck commands
```

### Per Task Pseudocode

```typescript
// Task 5 - Root Layout Critical Pattern
// app/layout.tsx
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/providers/WalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* CRITICAL: Same provider nesting as current root.tsx */}
        <NextUIProvider>
          <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
            <ClientOnly>
              <WalletProvider>
                {children}
              </WalletProvider>
            </ClientOnly>
          </ThemeProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}

// Task 6 - Route Conversion Critical Pattern  
// app/page.tsx (from _home._index/route.tsx)
import { fetchStatisticsOverview, fetchStatisticsRank } from "~/statistics/repository";

// Server Component - runs on server, replaces loader
export default async function HomePage() {
  // PATTERN: Replace loader with direct async calls
  const [statisticsResult, rankResult] = await Promise.all([
    fetchStatisticsOverview(),
    fetchStatisticsRank(),
  ]);

  // PRESERVE: Exact same fallback logic
  const statisticOverview = statisticsResult.success ? 
    statisticsResult.data : 
    { ecosystem: 0, repository: 0, developer: 0, coreDeveloper: 0 };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* CRITICAL: AI query section needs client component */}
      <AIQueryClientSection />
      <MetricOverview dataSource={statisticOverview} />
    </div>
  );
}

// Separate client component for interactivity
'use client';
function AIQueryClientSection() {
  // PRESERVE: Exact same streaming logic
  // CHANGE: useFetcher → fetch('/api/ai/query')
}

// Task 6 - API Route Critical Pattern
// app/api/ai/query/route.ts (from api.ai.query.ts)
import { fetchAnalyzedStatistics } from "~/ai/repository";

export async function POST(request: Request) {
  const formData = await request.formData();
  const res = await fetchAnalyzedStatistics({
    query: formData.get("query") as string,
  });
  
  // CRITICAL: Preserve exact same headers for streaming
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
```

### Integration Points
```yaml
ENVIRONMENT:
  - migrate: All VITE_* variables to Next.js env
  - pattern: "NEXT_PUBLIC_* for client-side vars"
  - preserve: API endpoints and authentication tokens

BUILD:
  - replace: Vite build with Next.js build
  - maintain: Same output structure for deployment
  - preserve: Docker configuration compatibility

DEPLOYMENT:
  - update: Dockerfile for Next.js
  - preserve: Environment variable injection
  - maintain: Same deployment flow
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
pnpm typecheck                   # TypeScript compilation
pnpm lint                       # ESLint checks  
pnpm build                      # Next.js build verification

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Functional Validation
```bash
# Start development server
pnpm dev

# Test critical routes (run all these)
curl http://localhost:3000/                    # Home page
curl http://localhost:3000/developers          # Developers list
curl http://localhost:3000/developers/vitalik.eth  # Developer detail
curl http://localhost:3000/ecosystems          # Ecosystems list  
curl http://localhost:3000/ecosystems/ethereum # Ecosystem detail
curl http://localhost:3000/repositories        # Repositories list
curl http://localhost:3000/admin               # Admin panel

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/me  # Auth check
curl -X POST http://localhost:3000/api/ai/query \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "query=test streaming" --no-buffer          # AI streaming

# Expected: All routes return proper responses, streaming works
```

### Level 3: Integration Test  
```bash
# Test complete user flows
1. Open http://localhost:3000
2. Verify home page loads with data
3. Test AI query input with streaming response
4. Navigate to developers page
5. Click on a developer profile
6. Test authentication flow
7. Connect Web3 wallet (if available)
8. Access admin panel (if authenticated)
9. Verify theme switching works
10. Test mobile responsiveness

# Expected: All functionality works identically to current Remix app
```

## Final Validation Checklist
- [ ] All tests pass: `pnpm test` (if tests exist)
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Build succeeds: `pnpm build`
- [ ] All 17 routes accessible and functional
- [ ] AI streaming responses work correctly
- [ ] Authentication flow complete
- [ ] Web3 wallet connection functional
- [ ] Theme switching works
- [ ] Admin panel accessible
- [ ] Performance equal or better than current
- [ ] No console errors in browser
- [ ] Mobile responsiveness maintained

---

## Anti-Patterns to Avoid
- ❌ Don't change domain logic during migration
- ❌ Don't skip "use client" directives for interactive components  
- ❌ Don't break streaming functionality for AI queries
- ❌ Don't change environment variable names
- ❌ Don't alter authentication flow
- ❌ Don't modify styling or UI components
- ❌ Don't ignore TypeScript errors
- ❌ Don't skip validation of each route

**Confidence Score: 9/10** - Very high likelihood of successful implementation with this detailed context and validation approach.
# Next.js Project Structure Refactoring PRP - Complete /src Elimination

## Goal
Completely eliminate the `/src` directory and restructure the project according to Next.js 15 App Router best practices. Move all code to appropriate root-level directories with proper separation of concerns and consistent kebab-case naming conventions.

## Why
- **Next.js Best Practices**: Eliminate `/src` directory in favor of standard Next.js project structure
- **Proper Separation**: Components, services, and utilities should be at root level for better organization
- **Domain Logic Organization**: Move domain logic to `/lib/services` and other appropriate locations
- **Cleaner Architecture**: Remove unnecessary nesting and improve project navigation
- **Consistency**: Implement consistent kebab-case naming throughout
- **Migration Cleanup**: Complete the Remix to Next.js migration by removing legacy patterns

## What
Eliminate `/src` directory entirely and redistribute code to proper Next.js locations with consistent kebab-case naming throughout the entire codebase:
- `/components` - UI components at root level
- `/lib/services` - Domain logic and business services
- `/lib/utils` - Utility functions
- `/lib/types` - Type definitions
- `/lib/config` - Configuration files
- `/app` - Refactor all files to use kebab-case naming

### Success Criteria
- [ ] Complete elimination of `/src` directory
- [ ] All components moved to root `/components` directory
- [ ] Domain logic reorganized into `/lib/services`
- [ ] Utilities moved to `/lib/utils`
- [ ] ALL folder names use kebab-case convention
- [ ] ALL file names use kebab-case convention (except special Next.js files)
- [ ] React components maintain PascalCase naming internally
- [ ] App directory files converted to kebab-case
- [ ] Path aliases updated to new structure
- [ ] All imports updated to use new paths and file names
- [ ] No build errors after refactoring
- [ ] All existing functionality preserved

## All Needed Context

### Documentation & References
```yaml
- url: https://nextjs.org/docs/app/getting-started/project-structure
  why: Official Next.js project structure guidelines and naming conventions

- url: https://nextjs.org/docs/app/building-your-application/routing/colocation
  why: Component colocation patterns and organization strategies

- file: /app/layout.tsx
  why: Root layout to understand current app structure

- file: /src/components/ecosystem-type-filter/EcosystemTypeFilter.tsx
  why: Example of current mixed naming (kebab-case folder, PascalCase component)

- file: /src/domain/
  why: Domain-driven design structure to preserve during refactoring

- file: /CLAUDE.md
  why: Project-specific guidelines and conventions to follow

- file: /tsconfig.json
  why: Path aliases configuration that needs to be maintained
```

### Current Codebase Structure (Issues to Address)
```bash
# CURRENT PROBLEMATIC STRUCTURE
/src/                                   # ❌ Entire directory should be eliminated
├── components/                         # → Move to /components (root level)
│   ├── controls/                       # Already corrected naming
│   ├── widgets/                        # Already corrected naming  
│   ├── ecosystem-type-filter/
│   ├── loading/
│   ├── navbar/
│   ├── section/
│   └── wallet/
├── domain/                             # → Move to /lib/services
│   ├── admin/
│   ├── ai/
│   ├── api/
│   ├── auth/
│   ├── developer/
│   ├── ecosystem/
│   ├── event/
│   ├── github/
│   ├── opendigger/
│   ├── origin/
│   ├── ossinsight/
│   ├── profile-analysis/
│   ├── repository/
│   ├── rss3/
│   └── statistics/
└── lib/                                # → Move to /lib (root level)
    ├── clients/
    ├── config/
    ├── providers/
    ├── types/
    └── utils/
```

### Desired Codebase Structure (Next.js Standard)
```bash
# TARGET STRUCTURE - NO /src DIRECTORY
/
├── app/                                # Next.js App Router (unchanged)
├── components/                         # UI components at root level
│   ├── controls/
│   │   ├── brand-logo/
│   │   ├── chart-card/
│   │   ├── data-table/
│   │   ├── file-upload/
│   │   ├── language-toggle/
│   │   └── metric-card/
│   ├── ecosystem-type-filter/
│   ├── loading/
│   ├── navbar/
│   ├── section/
│   ├── wallet/
│   ├── widgets/
│   └── ui/                             # Shared UI components
├── lib/                                # Utilities and business logic
│   ├── services/                       # Domain logic (from /src/domain)
│   │   ├── admin/
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── developer/
│   │   ├── ecosystem/
│   │   └── [other services]/
│   ├── clients/                        # HTTP clients
│   ├── config/                         # Configuration
│   ├── types/                          # Type definitions
│   └── utils/                          # Utility functions
├── public/                             # Static assets (unchanged)
└── [other root files]                  # Config files (unchanged)
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js App Router conventions
// - Components must be PascalCase: ComponentName.tsx
// - Folders should be kebab-case: component-name/
// - Special files: page.tsx, layout.tsx, route.ts must be exact names

// CRITICAL: Path alias preservation
// Current aliases in tsconfig.json:
// "@/*" → "./src/lib/*"  (shared resources)
// "~/*" → "./src/domain/*" (domain modules)
// "#/*" → "./app/*" (app router)

// CRITICAL: Import pattern preservation
// Existing imports use these patterns and must be updated:
import { Component } from "@/components/old-path";
import { DomainModule } from "~/domain/module";
import { AppComponent } from "#/app-component";

// GOTCHA: NextUI components and React components
// All .tsx files are React components - preserve PascalCase naming
// Only folders should be kebab-case

// GOTCHA: Index files
// Maintain existing index.ts files for clean imports
// Pattern: export { default } from './ComponentName';
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// File naming conventions to enforce:
interface NamingConventions {
  folders: "kebab-case";           // component-name/
  components: "PascalCase";        // ComponentName.tsx
  utilities: "camelCase";          // helperFunction.ts
  types: "camelCase";              // typing.ts
  configs: "kebab-case";           // next-config.js
}

// Directory structure patterns:
interface DirectoryPattern {
  components: {
    shared: "/src/components/";           // Global shared components
    domain: "/src/domain/*/views/";       // Domain-specific views
    widgets: "/src/domain/*/widgets/";    // Domain-specific widgets
  };
  utilities: "/src/lib/";                 // Shared utilities
  types: "/src/lib/types/";               // Shared types
}
```

### List of Tasks (In Order)

```yaml
Task 1: Remove Empty App Directory Folders [COMPLETED]
REMOVE empty folders in /app directory

Task 2: Create New Root-Level Directory Structure
CREATE new directories at root level:
  - /components/ (for UI components)
  - /lib/services/ (for domain logic)
  - /lib/utils/ (for utilities)
  - /lib/types/ (for type definitions)

Task 3: Move Components to Root Level
MOVE /src/components/ → /components/:
  - Preserve all subdirectory structure
  - Maintain component naming conventions
  - Keep existing index.ts files

Task 4: Reorganize Domain Logic to Services
MOVE /src/domain/ → /lib/services/:
  - Transform domain modules to service modules
  - Preserve business logic organization
  - Update internal imports within services

Task 5: Move Library Code to Root Level
MERGE /src/lib/ → /lib/:
  - Move clients/ to /lib/clients/
  - Move config/ to /lib/config/
  - Move providers/ to /lib/providers/
  - Move types/ to /lib/types/
  - Move utils/ to /lib/utils/

Task 6: Update Path Aliases
UPDATE tsconfig.json path aliases:
  - "@/*" → "./lib/*" (remove src/)
  - "~/*" → "./lib/services/*" (domain → services)
  - "#/*" → "./app/*" (unchanged)
  - "$/*" → "./components/*" (remove src/)

Task 7: Update All Import Statements
FIND and UPDATE all imports throughout codebase:
  - "@/components/" → "$/"
  - "~/domain/" → "~/services/"
  - "@/lib/" → "@/"
  - Relative imports to use new structure

Task 8: Convert All Files to Kebab-Case
RENAME all files to use kebab-case convention:
  - /app directory: PascalCase → kebab-case
  - /components directory: PascalCase → kebab-case  
  - Exception: Keep special Next.js files (page.tsx, layout.tsx, route.ts)
  - Update all imports to match new file names

Task 9: Remove /src Directory
DELETE /src directory entirely:
  - Verify all files moved successfully
  - Remove empty src directory
  - Clean up any remaining references

Task 10: Final Validation
RUN comprehensive validation:
  - pnpm lint (fix linting issues)
  - pnpm typecheck (verify no type errors)
  - pnpm build (ensure successful build)
  - Manual testing of key functionality
```

### Per Task Implementation Details

```typescript
// Task 1: Remove Empty Folders
// Use file system operations to remove empty route group folders
// These folders were created during Remix migration but never populated

// Task 2: Folder Renaming
// Move files preserving structure:
mv src/components/control src/components/controls
mv src/components/widget src/components/widgets

// Task 3: Import Updates
// Search and replace patterns:
// OLD: from "@/components/control/
// NEW: from "@/components/controls/
// OLD: from "@/components/widget/
// NEW: from "@/components/widgets/

// Task 4: Index File Updates
// Ensure re-exports work:
export { default as BrandLogo } from './brand-logo/BrandLogo';
export { default as ChartCard } from './chart-card/ChartCard';
// ... maintain all existing exports

// Task 5: Path Verification
// Test these import patterns work:
import { HttpClient } from "@/clients/http";          // lib alias
import { EcosystemRepository } from "~/ecosystem";     // domain alias
import { atoms } from "#/atoms";                       // app alias
```

### Integration Points
```yaml
TYPESCRIPT_CONFIG:
  - file: tsconfig.json
  - verify: Path aliases still resolve correctly
  - test: Import statements compile without errors

BUILD_SYSTEM:
  - tool: Next.js build system
  - verify: No build errors after refactoring
  - test: Production build succeeds

COMPONENT_EXPORTS:
  - files: All index.ts files in renamed folders
  - verify: Exports are maintained
  - test: Components can be imported from new paths

DEVELOPMENT_WORKFLOW:
  - tool: ESLint and TypeScript
  - verify: No linting or type errors
  - test: Development server starts without issues
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint                                 # ESLint checks with auto-fix
pnpm typecheck                           # TypeScript type checking

# Expected: No errors. If errors exist, fix before proceeding.
```

### Level 2: Build Verification
```bash
# Test the build process
pnpm build                               # Next.js production build

# Expected: Successful build with no errors
# If build fails: Check import paths and missing files
```

### Level 3: Development Server Test
```bash
# Start development server
pnpm dev                                 # Next.js development server

# Expected: Server starts without errors
# Navigate to different routes to verify functionality
# Test: http://localhost:3000
# Test: http://localhost:3000/developers
# Test: http://localhost:3000/ecosystems
```

### Level 4: Import Path Verification
```bash
# Verify no broken imports exist
grep -r "from.*control/" src/           # Should return no results
grep -r "from.*widget/" src/            # Should return no results  
grep -r "import.*control/" src/         # Should return no results
grep -r "import.*widget/" src/          # Should return no results

# Expected: No matches found (all paths updated)
```

## Final Validation Checklist
- [ ] All empty folders removed: `find app -type d -empty`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm typecheck`
- [ ] Build successful: `pnpm build`
- [ ] Development server starts: `pnpm dev`
- [ ] All imports updated: No references to old paths
- [ ] Component functionality preserved: Manual testing
- [ ] Path aliases working: Import resolution verified

## Anti-Patterns to Avoid
- ❌ Don't change React component names (keep PascalCase)
- ❌ Don't modify special Next.js files (page.tsx, layout.tsx, route.ts)
- ❌ Don't break existing domain structure in /src/domain/
- ❌ Don't change path alias mappings in tsconfig.json
- ❌ Don't remove or modify index.ts export patterns
- ❌ Don't change file extensions (.tsx, .ts, .js remain same)
- ❌ Don't modify app/ directory structure (only remove empty folders)

---

## Quality Assessment

**PRP Confidence Score: 9/10**

**Strengths:**
- Clear identification of specific naming inconsistencies
- Comprehensive analysis of current vs desired structure  
- Detailed task breakdown with specific file paths
- Executable validation commands for each level
- Preserves existing functionality and patterns
- Follows Next.js best practices documented officially

**Risk Mitigation:**
- Gradual approach with validation at each step
- Preserves all existing exports and functionality
- Clear rollback strategy (reverse the folder renames)
- Comprehensive testing checklist

**One-Pass Implementation Feasibility:** Very High
- All required context provided with specific file examples
- Clear validation gates to catch issues early
- Detailed anti-patterns to avoid common mistakes
- Specific grep commands to verify completion
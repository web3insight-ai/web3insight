# Repository Guidelines

## Project Structure & Module Organization
- `src/app` (# alias): Next.js App Router routes. API endpoints live under `src/app/api/*`. Global styles in `src/app/globals.css`; shared layout and providers in `src/app/layout.tsx` and `src/app/providers.tsx`.
- `src/components` ($ alias): Reusable UI components (PascalCase `.tsx`).
- `src/services` (~ alias): Domain logic and data access (e.g., `developer`, `repository`, `ecosystem`, `ai`, `github`, `api`). HTTP wrappers in `src/clients/http`.
- `src/config`, `src/providers`, `src/utils`, `src/types`: Configuration, context providers, helpers, and shared types.
- `public/`: Static assets. Root: Next/Tailwind config, linting, and tooling.

## Build, Test, and Development Commands
- `pnpm i`: Install dependencies.
- `cp .env.example .env`: Bootstrap local env vars (edit securely).
- `pnpm env`: Validate Node/tooling (Node >= 20) via `.knosys`.
- `pnpm dev`: Run local dev (Next.js + Turbopack).
- `pnpm build`: Production build; `pnpm start`: Serve built app.
- `pnpm lint`: ESLint; `pnpm typecheck`: TypeScript checks.

Example:
```
pnpm i
cp .env.example .env
pnpm env
pnpm dev
```

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, semicolons, trailing commas, no unused vars (ESLint).
- Prettier: double quotes (`singleQuote: false`).
- React components: PascalCase filenames/exports; Next.js route files lower-case.
- Use path aliases from `tsconfig.json`: `@env`, `@/*`, `~/*`, `#/*`, `$/*`.

## Testing Guidelines
- No formal suite yet. If adding tests, place under `src/__tests__/` and name `ComponentName.test.tsx` or `module.test.ts`.
- Prefer Vitest + React Testing Library for components; target services and utilities first.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`, etc. (mirrors current history).
- Pre-commit: Husky + lint-staged runs `eslint --fix` on staged TS/TSX.
- PRs: clear description, linked issues, screenshots for UI, note env/migration impacts. CI runs lint on PRs.

## Security & Configuration Tips
- Keep secrets out of VCS. Use `.env` locally; see `.env.example` (OpenAI, Redis, OSS Insight, RSS3, Strapi, Data API).
- Node ≥ 20 and `pnpm@9` are required (see `package.json`). Rotate keys regularly and avoid logging credentials.


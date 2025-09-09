# Repository Guidelines

## Project Structure & Module Organization
- `src/app` (`#/*`): Next.js App Router routes. APIs under `src/app/api/*`. Global styles: `src/app/globals.css`. Shared layout/providers: `src/app/layout.tsx`, `src/app/providers.tsx`.
- `src/components` (`$/*`): Reusable React components (PascalCase `.tsx`).
- `src/services` (`~/*`): Domain logic (e.g., `developer`, `repository`, `ecosystem`, `ai`, `github`, `api`). HTTP wrappers in `src/clients/http`.
- `src/config`, `src/providers`, `src/utils`, `src/types`: Configuration, context, helpers, shared types.
- `public/`: Static assets. Root contains Next/Tailwind config and tooling.

## Build, Test, and Development Commands
- `pnpm i`: Install dependencies (Node >= 20, `pnpm@9`).
- `cp .env.example .env`: Bootstrap local env vars (edit securely).
- `pnpm env`: Validate Node/tooling via `.knosys`.
- `pnpm dev`: Run local dev (Next.js + Turbopack).
- `pnpm build`: Create production build; `pnpm start`: Serve built app.
- `pnpm lint`: Run ESLint; `pnpm typecheck`: TypeScript checks.

Example:
```
pnpm i
cp .env.example .env
pnpm env
pnpm dev
```

## Coding Style & Naming Conventions
- TypeScript; 2-space indent; semicolons; trailing commas. Prettier uses double quotes.
- No unused vars (ESLint). Keep changes minimal and focused.
- Components: PascalCase filenames/exports. Next.js route files lower-case.
- Use path aliases from `tsconfig.json`: `@env`, `@/*`, `#/*`, `$/*`, `~/*`.

## Testing Guidelines
- No formal suite yet. Prefer Vitest + React Testing Library for new tests.
- Place tests under `src/__tests__/`. Name `ComponentName.test.tsx` or `module.test.ts`.
- Run via `vitest` or `pnpm test` when configured; target services/utilities first.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`, etc.
- Pre-commit: Husky + lint-staged runs `eslint --fix` on staged TS/TSX.
- PRs: clear description, linked issues, screenshots for UI, note env/migration impacts.
- CI runs lint on PRs; keep PRs small and coherent.

## Security & Configuration Tips
- Keep secrets out of VCS. Use `.env` locally; see `.env.example` (OpenAI, Redis, OSS Insight, RSS3, Strapi, Data API).
- Rotate keys regularly; avoid logging credentials.
- Require Node >= 20 and `pnpm@9`; verify with `pnpm env`.


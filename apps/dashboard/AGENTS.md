# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js route groups (`developers`, `ecosystems`, `devinsight`, `admin`) share `layout.tsx` and `globals.css`.
- Shared UI lives in `src/components`, with cross-cutting logic in `src/hooks` and `src/providers`.
- Data access lives in `src/clients` and `src/services`; shared helpers sit in `src/utils` and `src/types`, configuration in `config/` and `env.ts`, and assets in `public/`.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies (Node.js ≥ 20).
- `pnpm dev`: run the Next.js app locally with Turbopack.
- `pnpm build`: produce a production bundle.
- `pnpm start`: serve the built output.
- `pnpm lint`: execute ESLint with Prettier auto-formatting.
- `pnpm typecheck`: run the TypeScript compiler without emitting files.
- `pnpm env`: list required environment variables via the Knosys helper.

## Coding Style & Naming Conventions
- TypeScript + the Next.js ESLint preset enforce strict typing and accessible JSX—resolve warnings before a PR.
- Prettier runs via lint-staged; keep the default two-space indentation, trailing commas, and single quotes it produces.
- Components and pages use `PascalCase`; hooks start with `use`; helper utilities stay in `camelCase` near their feature.
- Compose Tailwind classes with semantic groupings and reuse tokens defined in `tailwind.config.ts` to avoid drift.

## Testing Guidelines
- A shared test runner is in progress; every change must still pass `pnpm lint` and `pnpm typecheck`.
- Add targeted unit or integration checks when introducing behavior, naming files `*.test.ts(x)` beside the module.
- For API or data-layer edits, document manual verification steps in the PR and add reusable fixtures under `src/services/__mocks__` when applicable.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit pattern in history (`feat:`, `refactor:`, `chore:`) with subjects ≤ 72 characters.
- Keep related changes within a commit and describe the rationale, not just the mechanics.
- PRs should summarize scope, link issues or roadmap items, list validation commands, and include UI screenshots or clips when visuals change.
- Call out new environment variables, migrations, or manual follow-up steps directly in the PR body.

## Security & Configuration Tips
- Store secrets in `.env.local`; never commit or capture them in screenshots.
- `env.ts` plus `@t3-oss/env-nextjs` enforces runtime schemas—run `pnpm env` to confirm expected keys before shipping.
- When adding external integrations, document required scopes, rate limits, and auth nuances in `config/` or the PR summary so downstream agents stay aligned.

## Cursor Cloud specific instructions

### Service overview
This repo is a **Next.js 16 frontend** (Turbopack dev server). It has no local database or Docker dependencies — all data comes from an external backend API (`DATA_API_URL`).

### Required environment variables
`DATA_API_TOKEN` and `OPENAI_API_KEY` are mandatory (validated by `src/env.ts` via `@t3-oss/env-nextjs`). Set `SKIP_ENV_VALIDATION=true` in `.env.local` to bypass validation when secrets are unavailable. `DATA_API_URL`, `OSSINSIGHT_URL`, and `OPENAI_BASE_URL` have working defaults.

### Running the dev server
`pnpm dev` starts the Turbopack dev server on port 3000. The `predev` script (`npm run env`) runs automatically and is safe to let execute.

### Lint / typecheck
- `pnpm lint` — ESLint (must pass cleanly).
- `pnpm typecheck` — exits 0 via `|| true`; third-party type errors are expected and documented in `CLAUDE.md`.

### Gotchas
- pnpm may warn about ignored build scripts (sharp, bufferutil, etc.). These are non-blocking for dev; do not run `pnpm approve-builds` interactively.
- The pre-commit hook runs `lint-staged` (Prettier + ESLint). Ensure code is formatted before committing.
- There is no automated test runner yet; validation relies on `pnpm lint` and `pnpm typecheck`.

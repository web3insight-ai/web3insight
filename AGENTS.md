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

### Environment variables
- A `.env.local` file must exist with at minimum `SKIP_ENV_VALIDATION=1` set so the dev server starts without all secrets.
- If `DATA_API_URL` and `DATA_API_TOKEN` are available (injected as VM secrets), add them to `.env.local` to get real backend data.
- `OPENAI_API_KEY` is required for the AI chat feature (`/api/ai/chat`) but not for general browsing; use `SKIP_ENV_VALIDATION=1` to bypass its validation.

### Running the dev server
- `pnpm dev` starts Next.js 16 with Turbopack on port 3000. The `predev` hook automatically runs `pnpm env` first.
- The app is a pure frontend; no local databases or Docker services are needed.

### Lint / typecheck
- `pnpm lint` should exit cleanly with no warnings.
- `pnpm typecheck` exits 0 via `|| true`; expect third-party type errors from `recharts`, `@nextui-org/react`, and event service types — these are known and non-blocking.

### Build script warnings
- `pnpm install` may warn about ignored build scripts (sharp, unrs-resolver, etc.). These are optional and do not block development. Do not run `pnpm approve-builds` interactively.

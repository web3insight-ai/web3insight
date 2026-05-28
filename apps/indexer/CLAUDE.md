# CLAUDE.md

Project-scoped guidance for `apps/indexer` (`@web3insight/indexer`). For monorepo-wide conventions, see `../../CLAUDE.md`.

## Project overview

Rust 2024 one-shot CLI that downloads GHArchive event files and bulk-ingests them into PostgreSQL `data.*` tables consumed by `@web3insight/api`.

This app is **not** deployed to Vercel. CI builds/tests it, and release binaries are produced through GitHub Releases on `indexer-v*` tags.

## Essential commands

```bash
pnpm --filter @web3insight/indexer build          # cargo build --release
pnpm --filter @web3insight/indexer start          # cargo run --release
pnpm --filter @web3insight/indexer test           # cargo test --all
pnpm --filter @web3insight/indexer lint           # cargo clippy -D warnings
pnpm --filter @web3insight/indexer format         # cargo fmt --all
pnpm --filter @web3insight/indexer typecheck      # cargo check --all-targets --all-features
```

## Data and safety rules

- Treat `DATABASE_URL` as potentially shared/prod. Ask before running ingestion, backfills, truncation, or migrations against non-local databases.
- Read-only Postgres inspection is allowed when needed (`SELECT`, `EXPLAIN`, schema listing).
- Keep the API `data.*` schema expectations in sync with `apps/api/AGENTS.md`; `data.events` is extremely large, so ingest and query logic must be concurrency- and index-aware.
- `FILTER_OUT_PAYLOAD`, `FILTER_OUT_BODY`, and `FILTER_OUT_BOT` change downstream analytics semantics; do not flip defaults casually.
- `MAX_FILE_CONCURRENT` and `MAX_DB_CONCURRENT` affect database load. Prefer conservative values unless measuring locally.

## Rust conventions

- Use idiomatic async Rust with `tokio`, `sqlx`, `reqwest`, and `tracing`.
- Prefer `anyhow::Result` at CLI orchestration boundaries; use more specific errors only where callers need to branch.
- Keep network download, decompression/parsing, filtering, and DB insertion concerns separated enough to test them independently.
- Run `cargo fmt` and `cargo clippy --all-targets --all-features -- -D warnings` before considering Rust changes done.

## Release notes

- Release tag namespace is `indexer-vX.Y.Z`.
- `.github/workflows/indexer-ci.yml` validates Rust changes on PR/push.
- `.github/workflows/indexer-build.yml` builds release binaries for supported platforms.

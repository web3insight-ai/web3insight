# Indexer App Guide

Scope: `apps/indexer/**`. Inherit the root guide; this file covers Rust indexer rules.

## Surface

- Package: `@web3insight/indexer`
- Rust 2024 one-shot CLI that downloads GHArchive files and ingests PostgreSQL `data.*` rows.
- Not deployed to Vercel. CI tests it; `indexer-v*` tags produce GitHub Release binaries.

## Commands

```bash
pnpm --filter @web3insight/indexer build
pnpm --filter @web3insight/indexer start
pnpm --filter @web3insight/indexer test
pnpm --filter @web3insight/indexer lint
pnpm --filter @web3insight/indexer format
pnpm --filter @web3insight/indexer typecheck
```

## Rules

- Treat `DATABASE_URL` as potentially production/shared. Ask before ingestion, backfills, truncation, migrations, or high-concurrency runs.
- Read-only Postgres inspection is allowed when needed.
- Keep API `data.*` schema expectations in sync with `apps/api/CLAUDE.md`.
- `FILTER_OUT_*` and concurrency knobs change analytics semantics/load; do not flip defaults casually.
- Use idiomatic async Rust with `tokio`, `sqlx`, `reqwest`, `tracing`, and `anyhow::Result` at CLI orchestration boundaries.

## Verification

Run `cargo fmt`, `cargo clippy --all-targets --all-features -- -D warnings`, and relevant tests before considering Rust changes done.

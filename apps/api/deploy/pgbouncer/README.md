# PgBouncer for Web3Insight self-hosted Postgres

Required by the Hono+Vercel rewrite: Vercel serverless functions cold-start often, each
creating new Postgres connections. Without a pooler in front of the self-hosted Postgres at
`95.217.113.40`, `pg_stat_activity` will quickly exceed `max_connections`.

## What this gives you

- PgBouncer on `95.217.113.40:6432` (transaction pooling mode)
- Up to 1000 client connections multiplexed onto ~25 backend connections
- Direct port `5432` remains open for migrations and long transactions

## Deploy on the VM

SSH to `95.217.113.40`, then in a directory like `/srv/pgbouncer/`:

1. **Rotate the Postgres password first** (it was pasted in plaintext during planning —
   treat as compromised). Run as the `postgres` superuser:
   ```sql
   ALTER USER postgres WITH PASSWORD '<new-strong-password>';
   ```

2. Create `userlist.txt` (PgBouncer auth file). Use the **md5 hash** form so the password
   does not appear in plaintext on disk:
   ```bash
   echo -n "<new-strong-password>postgres" | md5sum | awk '{print "\"postgres\" \"md5"$1"\""}' > userlist.txt
   chmod 600 userlist.txt
   ```

3. Drop in the `docker-compose.yml` from this directory.

4. Start it:
   ```bash
   docker compose up -d
   docker compose logs -f pgbouncer   # watch for "process up: PgBouncer X.Y.Z ... ready"
   ```

5. Verify from your laptop:
   ```bash
   psql 'postgres://postgres:<new-password>@95.217.113.40:6432/data?sslmode=disable' \
     -c 'SELECT now(), current_database();'
   ```

## Update Vercel env vars

In each Vercel project (api, dashboard for copilot DB) — set both **Production** and
**Preview** scopes:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgres://postgres:<new-password>@95.217.113.40:6432/data` |
| `DATABASE_URL_DIRECT` | `postgres://postgres:<new-password>@95.217.113.40:5432/data` |

`DATABASE_URL` is what Kysely (and oRPC handlers) will use. `DATABASE_URL_DIRECT` is for
migrations or any code that needs session-level features PgBouncer transaction mode breaks
(e.g. `LISTEN/NOTIFY`, prepared statements via the `pg` driver — `pg` disables them
automatically when connected to a `:6432` pooler so this is mostly informational).

## Firewall checklist

- Open inbound TCP 6432 to the public (or Vercel's egress IPs if you know them).
- Keep 5432 restricted to localhost + your office IP only — Vercel should never touch it.

## Monitor

PgBouncer admin console:
```bash
psql 'postgres://postgres:<new-password>@95.217.113.40:6432/pgbouncer?sslmode=disable' \
  -c 'SHOW POOLS;'
```

If `cl_active + cl_waiting` keeps climbing or `sv_active` saturates at `default_pool_size`,
raise `DEFAULT_POOL_SIZE` in `docker-compose.yml` and `docker compose restart pgbouncer`.

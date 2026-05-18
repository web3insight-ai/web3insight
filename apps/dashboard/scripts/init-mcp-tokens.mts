/**
 * One-off DDL runner for the copilot_mcp_tokens table.
 *
 * Reason: isCopilotDbReady only checks for the older copilot_sessions table,
 * so it returns true even when the new MCP table is missing. This script
 * applies the additive DDL in an idempotent way using the existing
 * COPILOT_DATABASE_WRITE_URL connection. Safe to re-run.
 *
 * Run with: pnpm --filter @web3insight/dashboard exec tsx scripts/init-mcp-tokens.mts
 */
import { Client } from "pg";

const url =
  process.env.COPILOT_DATABASE_WRITE_URL ?? process.env.COPILOT_DATABASE_URL;
if (!url) {
  console.error(
    "COPILOT_DATABASE_WRITE_URL (or COPILOT_DATABASE_URL) must be set",
  );
  process.exit(1);
}

const DDL = `
CREATE TABLE IF NOT EXISTS "api"."copilot_mcp_tokens" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id"       VARCHAR(255) NOT NULL,
  "name"          VARCHAR(80) NOT NULL,
  "token_hash"    VARCHAR(128) NOT NULL UNIQUE,
  "token_preview" VARCHAR(32) NOT NULL,
  "last_used_at"  TIMESTAMP WITH TIME ZONE,
  "revoked_at"    TIMESTAMP WITH TIME ZONE,
  "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_mcp_tokens_user
  ON "api"."copilot_mcp_tokens" ("user_id");

CREATE INDEX IF NOT EXISTS idx_copilot_mcp_tokens_active
  ON "api"."copilot_mcp_tokens" ("user_id")
  WHERE "revoked_at" IS NULL;
`;

const client = new Client({ connectionString: url });
await client.connect();
try {
  await client.query(DDL);
  console.log("[init-mcp-tokens] DDL applied.");

  // Reason: Mirror grants on copilot_sessions to copilot_mcp_tokens so the
  // read-only app role can SELECT/UPDATE the new table without us hard-coding
  // a role name (it differs between environments).
  const grants = await client.query<{ grantee: string; privilege_type: string }>(
    `SELECT DISTINCT grantee, privilege_type
       FROM information_schema.role_table_grants
      WHERE table_schema = 'api'
        AND table_name = 'copilot_sessions'
        AND grantee NOT IN ('PUBLIC', current_user)
        AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')`,
  );
  for (const { grantee, privilege_type } of grants.rows) {
    await client.query(
      `GRANT ${privilege_type} ON "api"."copilot_mcp_tokens" TO "${grantee}"`,
    );
    console.log(`[init-mcp-tokens] GRANT ${privilege_type} TO ${grantee}`);
  }
} finally {
  await client.end();
}

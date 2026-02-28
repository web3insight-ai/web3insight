import { tool } from "ai";
import { z } from "zod";
import { sql } from "kysely";
import { getCopilotDb } from "@/lib/db/copilot-db";
import {
  validateReadOnlySQL,
  wrapWithLimit,
  MAX_SQL_ROWS,
  SQL_TIMEOUT_MS,
} from "./sql-safety";

interface SqlToolResult {
  columns: string[];
  rows: unknown[];
  rowCount: number;
  truncated: boolean;
  error?: string;
}

/**
 * AI SDK tool that executes validated read-only SQL queries against the
 * Web3Insight analytics database.
 */
export const runSqlTool = tool({
  description:
    "Execute a read-only SQL query against the Web3Insight PostgreSQL database. " +
    "Only SELECT statements are allowed. Results are capped at 500 rows.",
  inputSchema: z.object({
    query: z.string().describe("The SQL SELECT query to execute"),
    explanation: z
      .string()
      .describe("Brief explanation of what this query does and why"),
  }),
  execute: async ({ query }): Promise<SqlToolResult> => {
    // Validate the query is read-only
    const validation = validateReadOnlySQL(query);
    if (!validation.valid) {
      return {
        error: `SQL validation failed: ${validation.error}`,
        columns: [],
        rows: [],
        rowCount: 0,
        truncated: false,
      };
    }

    const wrappedQuery = wrapWithLimit(query, MAX_SQL_ROWS);

    try {
      const db = getCopilotDb();

      // Reason: Execute inside a transaction with READ ONLY and a statement
      // timeout so that even if validation is bypassed, the DB enforces safety.
      const rows = await db.transaction().execute(async (trx) => {
        await sql`SET LOCAL statement_timeout = ${sql.lit(SQL_TIMEOUT_MS)}`.execute(
          trx,
        );
        await sql`SET TRANSACTION READ ONLY`.execute(trx);
        const { rows: resultRows } = await sql.raw(wrappedQuery).execute(trx);
        return resultRows;
      });

      const resultRows = rows as Record<string, unknown>[];
      const columns = resultRows.length > 0 ? Object.keys(resultRows[0]) : [];
      const truncated = resultRows.length >= MAX_SQL_ROWS;

      return {
        columns,
        rows: resultRows,
        rowCount: resultRows.length,
        truncated,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown database error";
      return {
        error: `Query execution failed: ${message}`,
        columns: [],
        rows: [],
        rowCount: 0,
        truncated: false,
      };
    }
  },
});

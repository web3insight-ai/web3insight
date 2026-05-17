/**
 * SQL validation and safety utilities for the DB sub-agent.
 * Ensures only read-only SELECT queries are executed.
 */

export const MAX_SQL_ROWS = 500;
export const SQL_TIMEOUT_MS = 15_000;

// Reason: These keywords indicate write/DDL/DCL operations that must be blocked.
// Checked as word boundaries (\b) to avoid false positives (e.g. "description" contains "drop" substring but not as a word).
const FORBIDDEN_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "CREATE",
  "ALTER",
  "TRUNCATE",
  "GRANT",
  "REVOKE",
  "MERGE",
  "UPSERT",
  "REPLACE",
  "EXEC",
  "EXECUTE",
  "CALL",
  "COPY",
  "VACUUM",
  "REINDEX",
  "CLUSTER",
  "LOCK",
  "UNLOCK",
  "NOTIFY",
  "LISTEN",
  "SET",
  "RESET",
  "DISCARD",
  "COMMENT",
  "SECURITY",
  "REASSIGN",
  "REFRESH",
] as const;

/**
 * Strip SQL comments and string literal contents from a query string
 * so that forbidden keywords inside comments or strings don't cause
 * false positives during validation.
 */
function stripCommentsAndStrings(query: string): string {
  // Reason: Process character-by-character to correctly handle string literals
  // and nested comment styles without regex lookahead issues.
  let result = "";
  let i = 0;

  while (i < query.length) {
    // Single-quoted string literal — replace contents with empty string marker
    if (query[i] === "'") {
      let end = i + 1;
      while (end < query.length) {
        if (query[end] === "'" && query[end + 1] === "'") {
          end += 2; // escaped quote
        } else if (query[end] === "'") {
          end += 1;
          break;
        } else {
          end += 1;
        }
      }
      // Reason: Replace string literal with placeholder so keywords
      // like SET inside 'data set' don't trigger false positives.
      result += "''";
      i = end;
      continue;
    }

    // Block comment  /* ... */
    if (query[i] === "/" && query[i + 1] === "*") {
      const end = query.indexOf("*/", i + 2);
      // Reason: Replace comment with a space so surrounding tokens don't merge
      result += " ";
      i = end === -1 ? query.length : end + 2;
      continue;
    }

    // Line comment  -- ...
    if (query[i] === "-" && query[i + 1] === "-") {
      const end = query.indexOf("\n", i + 2);
      result += " ";
      i = end === -1 ? query.length : end + 1;
      continue;
    }

    result += query[i];
    i += 1;
  }

  return result;
}

/**
 * Validate that a SQL query is read-only (SELECT only).
 * Returns `{ valid: true }` or `{ valid: false, error: string }`.
 */
export function validateReadOnlySQL(query: string): {
  valid: boolean;
  error?: string;
} {
  if (!query.trim()) {
    return { valid: false, error: "Empty query" };
  }

  const cleaned = stripCommentsAndStrings(query);

  // Reason: After stripping trailing semicolons, any remaining semicolons
  // indicate multiple statements which we must reject to prevent piggy-backing.
  const withoutTrailingSemicolon = cleaned.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    return {
      valid: false,
      error: "Multiple SQL statements are not allowed",
    };
  }

  // Reason: Build a single regex that matches any forbidden keyword as a
  // whole word (case-insensitive). Using \b ensures "description" won't
  // match "DROP" etc.
  const forbiddenPattern = new RegExp(
    `\\b(${FORBIDDEN_KEYWORDS.join("|")})\\b`,
    "i",
  );

  const match = cleaned.match(forbiddenPattern);
  if (match) {
    return {
      valid: false,
      error: `Forbidden SQL keyword: ${match[1].toUpperCase()}`,
    };
  }

  // Verify the query starts with SELECT or WITH (CTE)
  const trimmed = cleaned.trim();
  if (!/^(SELECT|WITH)\b/i.test(trimmed)) {
    return {
      valid: false,
      error: "Query must start with SELECT or WITH (CTE)",
    };
  }

  return { valid: true };
}

/**
 * Wrap a query with a LIMIT clause to prevent unbounded result sets.
 * Uses a subquery wrapper so the limit applies regardless of the original query.
 */
export function wrapWithLimit(query: string, maxRows: number): string {
  // Reason: Wrapping in a subquery guarantees the LIMIT applies even if
  // the inner query already has its own LIMIT (the outer one caps it).
  return `SELECT * FROM (${query.trim().replace(/;\s*$/, "")}) AS _q LIMIT ${maxRows}`;
}

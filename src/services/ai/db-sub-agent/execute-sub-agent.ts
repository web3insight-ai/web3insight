import { generateText, stepCountIs } from "ai";
import { getModel } from "~/ai/repository/client";
import { getDbSchemaPrompt } from "./db-schema-prompt";
import { runSqlTool } from "./run-sql-tool";

interface SubAgentResult {
  answer: string;
  data?: unknown[];
  columns?: string[];
  rowCount?: number;
}

interface SqlToolCallResult {
  columns?: string[];
  rows?: unknown[];
  rowCount?: number;
  error?: string;
}

/**
 * Orchestrates the DB sub-agent: sends the user question along with the
 * database schema to an LLM that can call `run_sql` to query the database,
 * then extracts the last successful result.
 */
export async function executeSubAgentQuery(input: {
  context: string;
  question: string;
}): Promise<SubAgentResult> {
  const userMessage = [
    input.context ? `Context: ${input.context}` : "",
    `Question: ${input.question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await generateText({
    model: getModel(),
    temperature: 0.2,
    system: getDbSchemaPrompt(),
    messages: [{ role: "user", content: userMessage }],
    tools: { run_sql: runSqlTool },
    // Reason: Allow up to 5 tool-call rounds so the agent can retry
    // if an initial SQL query fails (e.g. wrong column name).
    stopWhen: stepCountIs(5),
  });

  // Reason: Walk steps in reverse to find the last *successful* run_sql call.
  // A successful call has rows (possibly empty) and no error field.
  let lastSuccessfulResult: SqlToolCallResult | undefined;

  for (let i = result.steps.length - 1; i >= 0; i--) {
    const step = result.steps[i];
    for (const toolResult of step.toolResults) {
      if (toolResult.toolName === "run_sql") {
        const value = toolResult.output as SqlToolCallResult;
        if (!value.error) {
          lastSuccessfulResult = value;
          break;
        }
      }
    }
    if (lastSuccessfulResult) break;
  }

  return {
    answer: result.text,
    data: lastSuccessfulResult?.rows,
    columns: lastSuccessfulResult?.columns,
    rowCount: lastSuccessfulResult?.rowCount,
  };
}

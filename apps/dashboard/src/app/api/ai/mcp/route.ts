import type { Tool, ToolCallOptions } from "ai";
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import {
  getObjectShape,
  type ZodRawShapeCompat,
} from "@modelcontextprotocol/sdk/server/zod-compat.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { and, eq, isNull } from "drizzle-orm";
import { web3InsightTools } from "~/ai/tools";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_mcp_tokens } from "@/lib/db/schema/copilot";
import {
  hashMcpBearerToken,
  isGeneratedMcpBearerToken,
} from "@/lib/copilot/mcp-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 800;

type McpToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

interface McpPrincipal {
  kind: "manual-token";
  tokenId: string;
  userId: string;
}

function safeJsonStringify(value: unknown, space?: number): string {
  return JSON.stringify(
    value,
    (_key, currentValue) =>
      typeof currentValue === "bigint" ? currentValue.toString() : currentValue,
    space,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function toMcpToolResult(output: unknown): CallToolResult {
  const text = safeJsonStringify(output, 2) ?? String(output);

  return {
    content: [{ type: "text", text }],
    structuredContent: isRecord(output) ? output : { result: output },
  };
}

function getMcpPrincipal(authInfo?: AuthInfo): McpPrincipal | null {
  const extra = authInfo?.extra;
  const userId = extra?.userId;
  const tokenId = extra?.tokenId;

  if (typeof userId !== "string" || typeof tokenId !== "string") {
    return null;
  }

  return { kind: "manual-token", tokenId, userId };
}

function requireMcpPrincipal(extra: McpToolExtra): McpPrincipal {
  const principal = getMcpPrincipal(extra.authInfo);
  if (!principal) {
    throw new Error("Unauthorized MCP request");
  }

  return principal;
}

function getMcpToolInputSchema(
  tool: Pick<Tool, "inputSchema">,
): ZodRawShapeCompat {
  const shape = getObjectShape(
    tool.inputSchema as Parameters<typeof getObjectShape>[0],
  );
  if (shape) {
    return shape;
  }

  throw new Error("MCP tool input schema must be a Zod object.");
}

async function runAiSdkTool(
  extra: McpToolExtra,
  input: unknown,
  tool: Tool,
): Promise<CallToolResult> {
  const execute = (
    tool as Tool & {
      execute?: (
        input: unknown,
        options: ToolCallOptions,
      ) => unknown | Promise<unknown>;
    }
  ).execute;
  if (!execute) {
    throw new Error("MCP tool is not executable.");
  }

  const toolCallId = `mcp-${String(extra.requestId)}`;
  const options: ToolCallOptions = {
    abortSignal: extra.signal,
    messages: [],
    toolCallId,
  };

  // Reason: AI SDK v6 tool.execute may return a value, a promise, or an
  // async iterable for streaming tools. The Web3Insight tools are all plain
  // async functions, so we await the result directly.
  const output = await execute(input, options);
  return toMcpToolResult(output ?? null);
}

function registerWeb3InsightTool(
  server: McpServer,
  name: string,
  tool: Tool,
  annotations: ToolAnnotations = { openWorldHint: false, readOnlyHint: true },
): void {
  server.registerTool(
    name,
    {
      annotations,
      ...(typeof tool.description === "string"
        ? { description: tool.description }
        : {}),
      inputSchema: getMcpToolInputSchema(tool),
    },
    async (rawInput, extra) => {
      requireMcpPrincipal(extra);
      return runAiSdkTool(extra, rawInput, tool);
    },
  );
}

async function verifyGeneratedMcpToken(
  bearerToken: string,
): Promise<AuthInfo | undefined> {
  const dbReady = await isCopilotDbReady();
  if (!dbReady) {
    return undefined;
  }

  let tokenHash: string;
  try {
    tokenHash = hashMcpBearerToken(bearerToken);
  } catch (error) {
    console.error("[copilot-mcp] hashMcpBearerToken failed:", error);
    return undefined;
  }

  const db = getCopilotDb();
  const rows = await db
    .select({
      id: copilot_mcp_tokens.id,
      user_id: copilot_mcp_tokens.user_id,
    })
    .from(copilot_mcp_tokens)
    .where(
      and(
        eq(copilot_mcp_tokens.token_hash, tokenHash),
        isNull(copilot_mcp_tokens.revoked_at),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    return undefined;
  }

  // Reason: best-effort last_used_at refresh — never block the request on it.
  void getCopilotWriteDb()
    .update(copilot_mcp_tokens)
    .set({ last_used_at: new Date() })
    .where(eq(copilot_mcp_tokens.id, row.id))
    .catch((error) => {
      console.warn("[copilot-mcp] Failed to update token last_used_at:", error);
    });

  return {
    clientId: `w3i-mcp-token:${row.id}`,
    extra: {
      kind: "manual-token",
      tokenId: row.id,
      userId: row.user_id,
    },
    scopes: [],
    token: row.id,
  };
}

async function verifyMcpBearerToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) {
    return undefined;
  }

  if (!isGeneratedMcpBearerToken(bearerToken)) {
    return undefined;
  }

  return verifyGeneratedMcpToken(bearerToken);
}

const handler = withMcpAuth(
  createMcpHandler(
    (server) => {
      for (const [name, tool] of Object.entries(web3InsightTools)) {
        registerWeb3InsightTool(server, name, tool as Tool);
      }
    },
    {
      serverInfo: {
        name: "Web3Insight Copilot",
        version: "0.1.0",
      },
    },
    {
      basePath: "/api/ai",
      disableSse: true,
      maxDuration,
      verboseLogs: process.env.NODE_ENV !== "production",
    },
  ),
  verifyMcpBearerToken,
  {
    // Reason: web3insight's MCP is bearer-only. There is no OAuth
    // protected-resource metadata route, so advertising one would dangle
    // (clients would 404 chasing it). Omit it rather than point at nothing.
    required: true,
  },
);

export { handler as DELETE, handler as GET, handler as POST };

import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_mcp_tokens } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";
import {
  createMcpBearerToken,
  hashMcpBearerToken,
  tokenPreview,
} from "@/lib/copilot/mcp-token";

interface TokenRecord {
  createdAt: string;
  id: string;
  lastUsedAt: string | null;
  name: string;
  tokenPreview: string;
}

const createTokenSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

function rowToRecord(row: {
  id: string;
  name: string;
  token_preview: string;
  last_used_at: Date | null;
  created_at: Date;
}): TokenRecord {
  return {
    createdAt: row.created_at.toISOString(),
    id: row.id,
    lastUsedAt: row.last_used_at ? row.last_used_at.toISOString() : null,
    name: row.name,
    tokenPreview: row.token_preview,
  };
}

export async function GET(): Promise<
  NextResponse<{ tokens: TokenRecord[] } | { error: string }>
> {
  try {
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json(
        { error: "Copilot persistence is disabled" },
        { status: 503 },
      );
    }

    const userId = await getCopilotUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getCopilotDb();
    const rows = await db
      .select({
        id: copilot_mcp_tokens.id,
        name: copilot_mcp_tokens.name,
        token_preview: copilot_mcp_tokens.token_preview,
        last_used_at: copilot_mcp_tokens.last_used_at,
        created_at: copilot_mcp_tokens.created_at,
      })
      .from(copilot_mcp_tokens)
      .where(
        and(
          eq(copilot_mcp_tokens.user_id, userId),
          isNull(copilot_mcp_tokens.revoked_at),
        ),
      )
      .orderBy(desc(copilot_mcp_tokens.created_at));

    return NextResponse.json({ tokens: rows.map(rowToRecord) });
  } catch (error) {
    console.error("[copilot-mcp] Failed to list MCP tokens:", error);
    return NextResponse.json(
      { error: "Failed to list MCP tokens" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
): Promise<
  NextResponse<{ token: string; tokenRecord: TokenRecord } | { error: string }>
> {
  try {
    const json = (await request.json().catch(() => null)) as unknown;
    const parsed = createTokenSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "name must be a non-empty string up to 80 chars" },
        { status: 400 },
      );
    }

    if (!process.env.AUTH_SECRET) {
      return NextResponse.json(
        {
          error:
            "AUTH_SECRET is not configured on this server; cannot mint MCP tokens",
        },
        { status: 503 },
      );
    }

    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json(
        { error: "Copilot persistence is disabled" },
        { status: 503 },
      );
    }

    const userId = await getCopilotUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = createMcpBearerToken();
    const db = getCopilotWriteDb();
    const inserted = await db
      .insert(copilot_mcp_tokens)
      .values({
        user_id: userId,
        name: parsed.data.name,
        token_hash: hashMcpBearerToken(token),
        token_preview: tokenPreview(token),
      })
      .returning({
        id: copilot_mcp_tokens.id,
        name: copilot_mcp_tokens.name,
        token_preview: copilot_mcp_tokens.token_preview,
        last_used_at: copilot_mcp_tokens.last_used_at,
        created_at: copilot_mcp_tokens.created_at,
      });

    const row = inserted[0];
    if (!row) {
      throw new Error("Failed to insert MCP token row");
    }

    return NextResponse.json(
      { token, tokenRecord: rowToRecord(row) },
      { status: 201 },
    );
  } catch (error) {
    console.error("[copilot-mcp] Failed to create MCP token:", error);
    return NextResponse.json(
      { error: "Failed to create MCP token" },
      { status: 500 },
    );
  }
}

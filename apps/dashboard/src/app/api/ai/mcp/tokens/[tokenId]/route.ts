import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_mcp_tokens } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

type RouteParams = { params: Promise<{ tokenId: string }> };

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<{ success: true } | { error: string }>> {
  try {
    const { tokenId } = await params;
    if (!tokenId) {
      return NextResponse.json({ error: "Missing tokenId" }, { status: 400 });
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

    const db = getCopilotWriteDb();
    const updated = await db
      .update(copilot_mcp_tokens)
      .set({ revoked_at: new Date() })
      .where(
        and(
          eq(copilot_mcp_tokens.id, tokenId),
          eq(copilot_mcp_tokens.user_id, userId),
          isNull(copilot_mcp_tokens.revoked_at),
        ),
      )
      .returning({ id: copilot_mcp_tokens.id });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[copilot-mcp] Failed to revoke MCP token:", error);
    return NextResponse.json(
      { error: "Failed to revoke MCP token" },
      { status: 500 },
    );
  }
}

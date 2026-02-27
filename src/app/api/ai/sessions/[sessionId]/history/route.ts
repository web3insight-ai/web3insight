import { NextRequest, NextResponse } from "next/server";
import { getCopilotDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();

    if (!dbReady) {
      return NextResponse.json({ messages: [] });
    }

    const db = getCopilotDb();

    // Verify session exists and is not deleted
    const session = await db
      .selectFrom("api.copilot_sessions")
      .select("session_id")
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const rows = await db
      .selectFrom("api.copilot_messages")
      .select(["ui_message", "parent_id"])
      .where("session_id", "=", sessionId)
      .orderBy("created_at", "asc")
      .execute();

    const messages = rows.map((row) => ({
      message: row.ui_message,
      parentId: row.parent_id,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to load message history:", error);
    return NextResponse.json(
      { error: "Failed to load message history" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();

    if (!dbReady) {
      return NextResponse.json({
        session_id: sessionId,
        title: null,
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      });
    }

    const db = getCopilotDb();
    const session = await db
      .selectFrom("api.copilot_sessions")
      .selectAll()
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Failed to get session:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();

    if (!dbReady) {
      return NextResponse.json({ success: true });
    }

    const db = getCopilotWriteDb();
    const result = await db
      .updateTable("api.copilot_sessions")
      .set({ deleted_at: new Date() })
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}

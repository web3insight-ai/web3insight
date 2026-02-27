import { NextRequest, NextResponse } from "next/server";
import { getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json({ success: true });
    }
    const db = getCopilotWriteDb();

    const body = (await request.json()) as { title: string };

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const result = await db
      .updateTable("api.copilot_sessions")
      .set({ title: body.title.trim() })
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (result.numUpdatedRows === 0n) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to rename session:", error);
    return NextResponse.json(
      { error: "Failed to rename session" },
      { status: 500 },
    );
  }
}

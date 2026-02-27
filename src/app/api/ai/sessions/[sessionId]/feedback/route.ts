import { NextRequest, NextResponse } from "next/server";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";

type RouteParams = { params: Promise<{ sessionId: string }> };

interface FeedbackBody {
  messageId: string;
  type: "thumbs_up" | "thumbs_down";
  comment?: string;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json({ success: true });
    }
    const body = (await request.json()) as FeedbackBody;

    if (!body.messageId || !body.type) {
      return NextResponse.json(
        { error: "messageId and type are required" },
        { status: 400 },
      );
    }

    if (body.type !== "thumbs_up" && body.type !== "thumbs_down") {
      return NextResponse.json(
        { error: "type must be 'thumbs_up' or 'thumbs_down'" },
        { status: 400 },
      );
    }

    // Verify session exists and is not deleted (read-only query)
    const db = getCopilotDb();
    const session = await db
      .selectFrom("api.copilot_sessions")
      .select("session_id")
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null)
      .executeTakeFirst();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const writeDb = getCopilotWriteDb();
    await writeDb
      .insertInto("api.copilot_feedback")
      .values({
        id: crypto.randomUUID(),
        session_id: sessionId,
        message_id: body.messageId,
        feedback_type: body.type,
        comment: body.comment ?? null,
        created_at: new Date(),
      })
      .execute();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}

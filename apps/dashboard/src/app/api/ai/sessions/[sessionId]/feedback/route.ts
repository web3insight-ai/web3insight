import { NextRequest, NextResponse } from "next/server";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

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

    const userId = await getCopilotUserId();

    // Verify session exists, is not deleted, and belongs to the current user
    const db = getCopilotDb();
    let sessionQuery = db
      .selectFrom("api.copilot_sessions")
      .select("session_id")
      .where("session_id", "=", sessionId)
      .where("deleted_at", "is", null);

    if (userId) {
      sessionQuery = sessionQuery.where("user_id", "=", userId);
    } else {
      sessionQuery = sessionQuery.where("user_id", "is", null);
    }

    const session = await sessionQuery.executeTakeFirst();

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

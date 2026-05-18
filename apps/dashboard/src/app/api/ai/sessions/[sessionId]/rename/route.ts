import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json({ success: true });
    }

    const userId = await getCopilotUserId();
    const db = getCopilotWriteDb();

    const body = (await request.json()) as { title: string };

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const result = await db
      .update(copilot_sessions)
      .set({ title: body.title.trim() })
      .where(
        and(
          eq(copilot_sessions.session_id, sessionId),
          isNull(copilot_sessions.deleted_at),
          userId
            ? eq(copilot_sessions.user_id, userId)
            : isNull(copilot_sessions.user_id),
        ),
      )
      .returning({ session_id: copilot_sessions.session_id });

    if (result.length === 0) {
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

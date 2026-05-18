import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

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

    const userId = await getCopilotUserId();
    const db = getCopilotDb();

    // Reason: If authenticated, only allow access to own sessions.
    // Anonymous sessions (user_id IS NULL) are accessible when no user is logged in.
    const rows = await db
      .select()
      .from(copilot_sessions)
      .where(
        and(
          eq(copilot_sessions.session_id, sessionId),
          isNull(copilot_sessions.deleted_at),
          userId
            ? eq(copilot_sessions.user_id, userId)
            : isNull(copilot_sessions.user_id),
        ),
      )
      .limit(1);

    const session = rows[0];

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

    const userId = await getCopilotUserId();
    const db = getCopilotWriteDb();

    const result = await db
      .update(copilot_sessions)
      .set({ deleted_at: new Date() })
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
    console.error("Failed to delete session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}

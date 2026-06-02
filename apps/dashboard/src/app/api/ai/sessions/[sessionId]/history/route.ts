import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { getCopilotDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_messages, copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";
import { resolveViewerAccess } from "@/lib/auth/copilot-session-access";

type RouteParams = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();

    if (!dbReady) {
      return NextResponse.json({ messages: [] });
    }

    const userId = await getCopilotUserId();
    const db = getCopilotDb();

    // Reason: Resolve the session first to learn its access_level. Owners can
    // always read; public threads are readable by anyone (including anonymous);
    // private threads are owner-only.
    const sessionRows = await db
      .select({
        access_level: copilot_sessions.access_level,
        user_id: copilot_sessions.user_id,
      })
      .from(copilot_sessions)
      .where(
        and(
          eq(copilot_sessions.session_id, sessionId),
          isNull(copilot_sessions.deleted_at),
        ),
      )
      .limit(1);

    const session = sessionRows[0];
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { viewerAccess } = resolveViewerAccess(
      session.access_level,
      session.user_id,
      userId,
    );
    if (viewerAccess === "none") {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const rows = await db
      .select({
        ui_message: copilot_messages.ui_message,
        parent_id: copilot_messages.parent_id,
      })
      .from(copilot_messages)
      .where(eq(copilot_messages.session_id, sessionId))
      .orderBy(asc(copilot_messages.created_at));

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

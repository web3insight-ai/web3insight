import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { localId?: string };
    const sessionId = body.localId ?? crypto.randomUUID();
    const userId = await getCopilotUserId();

    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      // Reason: Return a valid session ID even without DB persistence.
      // The chat still works, but sessions won't be saved across reloads.
      return NextResponse.json({ remoteId: sessionId });
    }

    const db = getCopilotWriteDb();
    await db.insert(copilot_sessions).values({
      session_id: sessionId,
      title: null,
      user_id: userId,
      is_archived: false,
      deleted_at: null,
      last_active_at: new Date(),
      created_at: new Date(),
    });

    return NextResponse.json({ remoteId: sessionId });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json({ threads: [], nextOffset: null });
    }

    const userId = await getCopilotUserId();

    // Reason: Anonymous users have no sessions to list —
    // their sessions are created with user_id = null and not queryable.
    if (!userId) {
      return NextResponse.json({ threads: [], nextOffset: null });
    }

    const db = getCopilotDb();
    const { searchParams } = request.nextUrl;
    const archived = searchParams.get("archived") === "true";
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const offset = Number(searchParams.get("offset") ?? 0);

    const rows = await db
      .select({
        remoteId: copilot_sessions.session_id,
        title: copilot_sessions.title,
        createdAt: copilot_sessions.created_at,
        lastActiveAt: copilot_sessions.last_active_at,
      })
      .from(copilot_sessions)
      .where(
        and(
          isNull(copilot_sessions.deleted_at),
          eq(copilot_sessions.is_archived, archived),
          eq(copilot_sessions.user_id, userId),
        ),
      )
      .orderBy(desc(copilot_sessions.last_active_at))
      .limit(limit + 1)
      .offset(offset);

    // Reason: Fetch one extra row to determine if there is a next page
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextOffset = hasMore ? offset + limit : null;

    return NextResponse.json({ threads: page, nextOffset });
  } catch (error) {
    console.error("Failed to list sessions:", error);
    return NextResponse.json(
      { error: "Failed to list sessions" },
      { status: 500 },
    );
  }
}

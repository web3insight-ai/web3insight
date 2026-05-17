import { NextRequest, NextResponse } from "next/server";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
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
    await db
      .insertInto("api.copilot_sessions")
      .values({
        session_id: sessionId,
        title: null,
        user_id: userId,
        is_archived: false,
        deleted_at: null,
        last_active_at: new Date(),
        created_at: new Date(),
      })
      .execute();

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

    const threads = await db
      .selectFrom("api.copilot_sessions")
      .select([
        "session_id as remoteId",
        "title",
        "created_at as createdAt",
        "last_active_at as lastActiveAt",
      ])
      .where("deleted_at", "is", null)
      .where("is_archived", "=", archived)
      .where("user_id", "=", userId)
      .orderBy("last_active_at", "desc")
      .limit(limit + 1)
      .offset(offset)
      .execute();

    // Reason: Fetch one extra row to determine if there is a next page
    const hasMore = threads.length > limit;
    const page = hasMore ? threads.slice(0, limit) : threads;
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

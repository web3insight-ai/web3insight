import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { getCopilotDb, getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

type RouteParams = { params: Promise<{ sessionId: string }> };

const ACCESS_LEVELS = ["private", "public"] as const;
type AccessLevel = (typeof ACCESS_LEVELS)[number];

interface AccessResponse {
  // Reason: `viewerAccess` is the *viewer*'s effective permission (full, read,
  // or none). `accessLevel` is the session's setting (private/public). The
  // share UI uses both — `accessLevel` to render the current radio selection,
  // `viewerAccess` to gate the editor controls.
  accessLevel: AccessLevel;
  isOwner: boolean;
  viewerAccess: "full" | "read" | "none";
}

function isAccessLevel(value: unknown): value is AccessLevel {
  return ACCESS_LEVELS.includes(value as AccessLevel);
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<AccessResponse | { error: string }>> {
  try {
    const { sessionId } = await params;
    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json(
        { error: "Copilot persistence is disabled" },
        { status: 503 },
      );
    }

    const userId = await getCopilotUserId();
    const db = getCopilotDb();

    const rows = await db
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

    const session = rows[0];
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const accessLevel = isAccessLevel(session.access_level)
      ? session.access_level
      : "private";

    const isOwner =
      userId !== null && session.user_id !== null && session.user_id === userId;

    const viewerAccess: AccessResponse["viewerAccess"] = isOwner
      ? "full"
      : accessLevel === "public"
        ? "read"
        : "none";

    if (viewerAccess === "none") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      accessLevel,
      isOwner,
      viewerAccess,
    });
  } catch (error) {
    console.error("Failed to read access level:", error);
    return NextResponse.json(
      { error: "Failed to read access level" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<AccessResponse | { error: string }>> {
  try {
    const { sessionId } = await params;
    const body = (await request.json()) as { accessLevel?: unknown };
    if (!isAccessLevel(body.accessLevel)) {
      return NextResponse.json(
        { error: "accessLevel must be 'private' or 'public'" },
        { status: 400 },
      );
    }

    const dbReady = await isCopilotDbReady();
    if (!dbReady) {
      return NextResponse.json(
        { error: "Copilot persistence is disabled" },
        { status: 503 },
      );
    }

    const userId = await getCopilotUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getCopilotWriteDb();
    const updated = await db
      .update(copilot_sessions)
      .set({ access_level: body.accessLevel })
      .where(
        and(
          eq(copilot_sessions.session_id, sessionId),
          isNull(copilot_sessions.deleted_at),
          eq(copilot_sessions.user_id, userId),
        ),
      )
      .returning({
        access_level: copilot_sessions.access_level,
      });

    if (updated.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      accessLevel: body.accessLevel,
      isOwner: true,
      viewerAccess: "full",
    });
  } catch (error) {
    console.error("Failed to update access level:", error);
    return NextResponse.json(
      { error: "Failed to update access level" },
      { status: 500 },
    );
  }
}

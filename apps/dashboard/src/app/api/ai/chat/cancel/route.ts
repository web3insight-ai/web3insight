import { and, eq, isNull } from "drizzle-orm";

import { getCopilotUserId } from "@/lib/auth/copilot-auth";
import { resolveViewerAccess } from "@/lib/auth/copilot-session-access";
import { getCopilotDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_sessions } from "@/lib/db/schema/copilot";
import { requestStop } from "../stream-storage";

interface CancelRequestBody {
  sessionId?: string;
}

// Reason: A cancel request aborts an in-flight stream, so confirm the caller
// owns the session (or it is public) before honoring it — otherwise anyone who
// knows a sessionId could stop another user's generation. Verification is
// skipped only when it is impossible (DB unavailable, or no persisted session
// yet), which leaves no cross-user session to protect.
async function canCancelSession(sessionId: string): Promise<boolean> {
  if (!(await isCopilotDbReady())) {
    return true;
  }

  const userId = await getCopilotUserId();
  const db = getCopilotDb();
  const rows = await db
    .select({
      user_id: copilot_sessions.user_id,
      access_level: copilot_sessions.access_level,
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
    return true;
  }

  const { viewerAccess } = resolveViewerAccess(
    session.access_level,
    session.user_id,
    userId,
  );
  return viewerAccess !== "none";
}

/**
 * POST /api/ai/chat/cancel
 * Body: { sessionId }
 *
 * Marks the session's currently-streaming response for cancellation. The
 * matching POST /api/ai/chat handler polls the stop flag every second and
 * triggers `abortController.abort()` on the upstream `streamText` call,
 * which (a) stops billable token generation and (b) ends the SSE response
 * cleanly so the client's `useChat` settles to status='ready'.
 */
export async function POST(request: Request) {
  let body: CancelRequestBody;
  try {
    body = (await request.json()) as CancelRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "sessionId is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!(await canCancelSession(sessionId))) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  requestStop(sessionId);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

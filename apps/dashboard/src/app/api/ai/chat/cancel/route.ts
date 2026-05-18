import { requestStop } from "../stream-storage";

interface CancelRequestBody {
  sessionId?: string;
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

  requestStop(sessionId);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

import { createUIMessageStreamResponse, type UIMessageChunk } from "ai";
import {
  clearActiveStream,
  getActiveStreamId,
  hasResumeStream,
  subscribeToResumeStream,
} from "../stream-storage";

export const maxDuration = 60;

/**
 * GET /api/ai/chat/resume?sessionId=...&lastEventId=...
 *
 * Returns the same SSE shape as POST /api/ai/chat so the AI SDK's
 * DefaultChatTransport.reconnectToStream can re-attach mid-stream. When no
 * active stream is associated with the session the route returns a 204 and
 * the client falls back to "no resume".
 *
 * Pairs with apps/dashboard/src/app/copilot/_components/chat-shell/lib/
 * chat-instance-cache.ts which wires `prepareReconnectToStreamRequest` to
 * point at this route.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response("sessionId is required", { status: 400 });
  }

  const lastEventIdRaw = url.searchParams.get("lastEventId");
  const lastEventId =
    lastEventIdRaw && /^-?\d+$/.test(lastEventIdRaw)
      ? Number.parseInt(lastEventIdRaw, 10)
      : -1;

  const streamId = getActiveStreamId(sessionId);
  if (!streamId || !hasResumeStream(streamId)) {
    if (streamId) {
      clearActiveStream(sessionId);
    }
    return new Response(null, { status: 204 });
  }

  const chunkStream = new ReadableStream<UIMessageChunk>({
    async start(controller) {
      try {
        for await (const event of subscribeToResumeStream(
          streamId,
          lastEventId,
        )) {
          if (event.kind === "chunk") {
            controller.enqueue(event.chunk);
          } else if (event.kind === "done") {
            break;
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return createUIMessageStreamResponse({ stream: chunkStream });
}

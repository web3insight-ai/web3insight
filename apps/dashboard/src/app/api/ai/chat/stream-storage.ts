import "server-only";

import type { UIMessageChunk } from "ai";

import {
  mirrorFinishStream,
  mirrorRegisterStream,
  mirrorResumeEvent,
} from "./redis-resume-store";

/**
 * In-memory publisher for resumable copilot streams.
 *
 * Mirrors the behaviour of euka's Redis-backed stream-storage (see
 * apps/brand/tts/src/orpc/routers/copilot/chat/stream-storage.ts) but stays
 * within a single Node.js process. On Vercel this only resumes streams that
 * land on the same warm function instance; on cold-start or a different
 * instance the client gets `null` and falls back to "no resume".
 *
 * The chosen trade-off (in-memory) means we do not pay the Redis dependency
 * cost while still fixing the dev-and-warm-instance "switch tab kills the
 * stream" bug. If the dashboard later grows a Redis dependency this module
 * can be swapped for an `IORedisPublisher` without touching the route code.
 */

export type CopilotResumeStreamEvent =
  | { kind: "ready" }
  | { kind: "chunk"; chunk: UIMessageChunk }
  | { kind: "done" };

interface BufferedEvent {
  eventId: number;
  event: CopilotResumeStreamEvent;
}

interface ActiveStream {
  buffer: BufferedEvent[];
  finished: boolean;
  /** Listeners are notified after every new event for live tailing. */
  listeners: Set<(event: BufferedEvent) => void>;
  nextEventId: number;
  sessionId: string;
  startedAt: number;
  streamId: string;
}

interface StopRequest {
  requestedAt: number;
}

// Reason: Hard cap so a long-running stream cannot leak unbounded memory if
// the client never reconnects to drain the buffer.
const MAX_BUFFER_PER_STREAM = 2_000;
const STREAM_RETENTION_MS = 60 * 60 * 1_000;
const STOP_REQUEST_TTL_MS = 60 * 60 * 1_000;

const activeStreamsBySession = new Map<string, ActiveStream>();
const streamsById = new Map<string, ActiveStream>();
const stopRequests = new Map<string, StopRequest>();

function pruneExpiredStreams() {
  const now = Date.now();
  for (const [streamId, stream] of streamsById) {
    if (stream.finished && now - stream.startedAt > STREAM_RETENTION_MS) {
      streamsById.delete(streamId);
      if (activeStreamsBySession.get(stream.sessionId)?.streamId === streamId) {
        activeStreamsBySession.delete(stream.sessionId);
      }
    }
  }
  for (const [sessionId, request] of stopRequests) {
    if (now - request.requestedAt > STOP_REQUEST_TTL_MS) {
      stopRequests.delete(sessionId);
    }
  }
}

export function registerActiveStream(
  sessionId: string,
  streamId: string,
): void {
  pruneExpiredStreams();
  const stream: ActiveStream = {
    buffer: [],
    finished: false,
    listeners: new Set(),
    nextEventId: 0,
    sessionId,
    startedAt: Date.now(),
    streamId,
  };
  activeStreamsBySession.set(sessionId, stream);
  streamsById.set(streamId, stream);
  mirrorRegisterStream(sessionId, streamId);
}

export function clearActiveStream(sessionId: string): void {
  const existing = activeStreamsBySession.get(sessionId);
  if (!existing) {
    return;
  }
  activeStreamsBySession.delete(sessionId);
  // Reason: Leave the stream entry in streamsById so an in-flight resume
  // subscriber can finish draining its buffer. It expires via the retention
  // sweep above.
  existing.finished = true;
  mirrorFinishStream(existing.streamId);
  for (const listener of existing.listeners) {
    listener({
      eventId: existing.nextEventId,
      event: { kind: "done" },
    });
  }
}

export function getActiveStreamId(sessionId: string): string | null {
  return activeStreamsBySession.get(sessionId)?.streamId ?? null;
}

export function hasResumeStream(streamId: string): boolean {
  return streamsById.has(streamId);
}

export function publishResumeEvent(
  streamId: string,
  event: CopilotResumeStreamEvent,
): void {
  const stream = streamsById.get(streamId);
  if (!stream) {
    return;
  }

  const buffered: BufferedEvent = {
    eventId: stream.nextEventId++,
    event,
  };
  stream.buffer.push(buffered);
  mirrorResumeEvent(streamId, buffered.eventId, event);
  if (stream.buffer.length > MAX_BUFFER_PER_STREAM) {
    stream.buffer.splice(0, stream.buffer.length - MAX_BUFFER_PER_STREAM);
  }
  if (event.kind === "done") {
    stream.finished = true;
  }
  for (const listener of stream.listeners) {
    listener(buffered);
  }
}

export function requestStop(sessionId: string): void {
  stopRequests.set(sessionId, { requestedAt: Date.now() });
  clearActiveStream(sessionId);
}

export function getStopRequestedAt(sessionId: string): number | null {
  return stopRequests.get(sessionId)?.requestedAt ?? null;
}

export function clearStopRequest(sessionId: string): void {
  stopRequests.delete(sessionId);
}

/**
 * Async iterable for a resume subscriber. Replays buffered events from
 * `lastEventId + 1` onward, then live-tails until `{ kind: "done" }` arrives
 * or the consumer breaks the loop.
 */
export async function* subscribeToResumeStream(
  streamId: string,
  lastEventId = -1,
): AsyncGenerator<CopilotResumeStreamEvent, void, unknown> {
  const stream = streamsById.get(streamId);
  if (!stream) {
    return;
  }

  // Replay everything already buffered past `lastEventId`.
  for (const buffered of stream.buffer) {
    if (buffered.eventId > lastEventId) {
      yield buffered.event;
      if (buffered.event.kind === "done") {
        return;
      }
    }
  }

  if (stream.finished) {
    return;
  }

  // Live-tail with a single-slot mailbox so the producer never blocks on us.
  const pending: BufferedEvent[] = [];
  let notify: (() => void) | null = null;

  const listener = (event: BufferedEvent) => {
    pending.push(event);
    notify?.();
  };
  stream.listeners.add(listener);

  try {
    while (true) {
      if (pending.length === 0) {
        await new Promise<void>((resolve) => {
          notify = resolve;
        });
        notify = null;
      }
      while (pending.length > 0) {
        const buffered = pending.shift();
        if (!buffered) {
          continue;
        }
        yield buffered.event;
        if (buffered.event.kind === "done") {
          return;
        }
      }
    }
  } finally {
    stream.listeners.delete(listener);
  }
}

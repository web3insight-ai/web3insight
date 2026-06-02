import "server-only";

import { Redis } from "@upstash/redis";

import type { CopilotResumeStreamEvent } from "./stream-storage";

/**
 * Best-effort Upstash (REST) mirror of the in-memory resume buffer.
 *
 * The in-memory `stream-storage` module stays the source of truth for
 * same-instance live-tailing. This mirror lets a *different* serverless
 * instance (cold start, or a separate lambda the resume request lands on)
 * replay a stream the original instance's memory can't see. All writes are
 * fire-and-forget; if Redis is unconfigured or fails, the copilot falls back
 * to the previous in-memory-only behavior.
 */

interface MirroredEvent {
  eventId: number;
  event: CopilotResumeStreamEvent;
}

const SESS_PREFIX = "copilot:resume:sess:";
const BUF_PREFIX = "copilot:resume:buf:";
const DONE_PREFIX = "copilot:resume:done:";
// Matches the in-memory STREAM_RETENTION_MS (1h).
const TTL_SECONDS = 60 * 60;

const POLL_INTERVAL_MS = 600;
// Stay under the resume route's maxDuration (60s).
const MAX_POLL_MS = 55_000;

// undefined = not yet resolved; null = not configured.
let cachedClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  cachedClient = url && token ? new Redis({ url, token }) : null;
  return cachedClient;
}

export function isRedisResumeEnabled(): boolean {
  return getRedis() !== null;
}

export function mirrorRegisterStream(
  sessionId: string,
  streamId: string,
): void {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  void redis
    .pipeline()
    .set(`${SESS_PREFIX}${sessionId}`, streamId, { ex: TTL_SECONDS })
    .del(`${BUF_PREFIX}${streamId}`)
    .del(`${DONE_PREFIX}${streamId}`)
    .exec()
    .catch((error) => {
      console.warn("[copilot-resume] mirrorRegisterStream failed:", error);
    });
}

export function mirrorResumeEvent(
  streamId: string,
  eventId: number,
  event: CopilotResumeStreamEvent,
): void {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const bufKey = `${BUF_PREFIX}${streamId}`;
  const payload: MirroredEvent = { eventId, event };
  const pipe = redis
    .pipeline()
    .rpush(bufKey, payload)
    .expire(bufKey, TTL_SECONDS);

  if (event.kind === "done") {
    pipe.set(`${DONE_PREFIX}${streamId}`, "1", { ex: TTL_SECONDS });
  }

  void pipe.exec().catch((error) => {
    console.warn("[copilot-resume] mirrorResumeEvent failed:", error);
  });
}

export function mirrorFinishStream(streamId: string): void {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  void redis
    .set(`${DONE_PREFIX}${streamId}`, "1", { ex: TTL_SECONDS })
    .catch((error) => {
      console.warn("[copilot-resume] mirrorFinishStream failed:", error);
    });
}

export async function getRedisActiveStreamId(
  sessionId: string,
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return await redis.get<string>(`${SESS_PREFIX}${sessionId}`);
  } catch (error) {
    console.warn("[copilot-resume] getRedisActiveStreamId failed:", error);
    return null;
  }
}

function parseMirroredEvent(raw: unknown): MirroredEvent | null {
  // Upstash may return the value already parsed (object) or as a JSON string.
  if (
    raw &&
    typeof raw === "object" &&
    "eventId" in raw &&
    "event" in raw
  ) {
    return raw as MirroredEvent;
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as MirroredEvent;
    } catch {
      return null;
    }
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cross-instance replay: drains the mirrored buffer past `lastEventId`, then
 * polls for new events until the stream is marked done or the time budget
 * expires. Used by the resume route only when the local in-memory store misses.
 */
export async function* subscribeToRedisResumeStream(
  streamId: string,
  lastEventId = -1,
): AsyncGenerator<CopilotResumeStreamEvent, void, unknown> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const bufKey = `${BUF_PREFIX}${streamId}`;
  const doneKey = `${DONE_PREFIX}${streamId}`;
  const deadline = Date.now() + MAX_POLL_MS;
  let cursor = 0;
  let emptyPolls = 0;

  while (Date.now() < deadline) {
    let items: unknown[];
    try {
      items = (await redis.lrange(bufKey, cursor, -1)) as unknown[];
    } catch (error) {
      console.warn("[copilot-resume] lrange failed:", error);
      return;
    }

    for (const raw of items) {
      cursor += 1;
      const parsed = parseMirroredEvent(raw);
      if (!parsed) {
        continue;
      }
      if (parsed.eventId > lastEventId) {
        yield parsed.event;
        if (parsed.event.kind === "done") {
          return;
        }
      }
    }

    let done = false;
    try {
      done = Boolean(await redis.get(doneKey));
    } catch {
      // Treat a failed done-check as "not done" and keep polling.
    }
    if (done) {
      return;
    }

    // Reason: An active mirrored stream always carries at least a "ready"
    // event, so an empty buffer after a few polls means the stream isn't live
    // — give up instead of holding the connection for the full deadline.
    emptyPolls = cursor === 0 ? emptyPolls + 1 : 0;
    if (emptyPolls >= 3) {
      return;
    }

    await sleep(POLL_INTERVAL_MS);
  }
}

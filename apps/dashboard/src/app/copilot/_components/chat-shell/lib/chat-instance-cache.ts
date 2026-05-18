import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { CopilotUIMessage } from "~/ai/copilot-types";

/**
 * Per-session Chat instance pool with stream resumption + onFinish callback
 * indirection.
 *
 * Why this exists:
 * - Switching sessions mid-stream tore in-flight responses because we shared
 *   a single global Chat instance keyed by `"web3insight"`. The pool keys
 *   each Chat by session id (or `draft:<userId>` for the not-yet-saved one).
 * - The AI SDK's `useChat({ resume: true })` calls `transport.reconnectToStream`
 *   on mount; the default transport handles the GET round-trip if we provide
 *   `prepareReconnectToStreamRequest` to point at our resume route.
 * - `onFinish` fires asynchronously after the Chat instance is constructed.
 *   The finish handler must run against the *current* session lifecycle, so
 *   we hold an `onFinishRef` and reassign it on every render of
 *   use-chat-controller.
 */

export interface CopilotChatFinishEvent {
  isAbort: boolean;
  isDisconnect: boolean;
  isError: boolean;
  message: CopilotUIMessage;
  sessionId: string | null;
}

export type CopilotChatFinishHandler = (event: CopilotChatFinishEvent) => void;

export interface CopilotChatInstanceEntry {
  abortReconnectStream: () => void;
  chat: Chat<CopilotUIMessage>;
  onFinishRef: { current: CopilotChatFinishHandler };
  sessionId: string | null;
  touchedAt: number;
}

interface GetOrCreateCopilotChatInstanceArgs {
  getFinishHandler: () => CopilotChatFinishHandler;
  invalidateThreadQueries: () => void;
  sessionId: string | null;
}

const MAX_CACHED_CHAT_INSTANCES = 4;
const DRAFT_CACHE_KEY = "draft:web3insight";
const copilotChatInstanceCache = new Map<string, CopilotChatInstanceEntry>();

function getCacheKey(sessionId: string | null): string {
  return sessionId ? `session:${sessionId}` : DRAFT_CACHE_KEY;
}

function evictOldChatInstances() {
  if (copilotChatInstanceCache.size <= MAX_CACHED_CHAT_INSTANCES) {
    return;
  }

  let oldestKey: string | null = null;
  let oldestTouchedAt = Number.POSITIVE_INFINITY;

  for (const [key, entry] of copilotChatInstanceCache.entries()) {
    if (entry.touchedAt < oldestTouchedAt) {
      oldestTouchedAt = entry.touchedAt;
      oldestKey = key;
    }
  }

  if (!oldestKey) {
    return;
  }

  copilotChatInstanceCache.delete(oldestKey);
}

export function getOrCreateCopilotChatInstance({
  getFinishHandler,
  invalidateThreadQueries,
  sessionId,
}: GetOrCreateCopilotChatInstanceArgs): CopilotChatInstanceEntry {
  const cacheKey = getCacheKey(sessionId);
  const now = Date.now();
  const existing = copilotChatInstanceCache.get(cacheKey);

  if (existing) {
    existing.onFinishRef.current = getFinishHandler();
    existing.touchedAt = now;
    return existing;
  }

  const onFinishRef: CopilotChatInstanceEntry["onFinishRef"] = {
    current: getFinishHandler(),
  };

  let reconnectAbortController: AbortController | null = null;
  let isReconnectInFlight = false;

  const abortReconnectStream = () => {
    reconnectAbortController?.abort();
    reconnectAbortController = null;
  };

  const transport = new DefaultChatTransport<CopilotUIMessage>({
    api: "/api/ai/chat",
    prepareSendMessagesRequest: ({ messages, body }) => {
      if (!sessionId) {
        throw new Error("Copilot session is not initialized");
      }
      return {
        body: {
          ...body,
          sessionId,
          messages,
        },
      };
    },
    prepareReconnectToStreamRequest: ({ api }) => {
      if (!sessionId) {
        return { api };
      }
      // Reason: Default transport issues a GET; we encode sessionId as a
      // query param so the resume route can look up the active stream.
      // Mark the reconnect in-flight so abortReconnectStream() can be a
      // no-op when there is nothing to cancel.
      if (isReconnectInFlight) {
        // The fetch is owned by DefaultChatTransport; we only own its abort
        // controller after the GET has begun. This branch effectively serialises
        // overlapping reconnects.
        abortReconnectStream();
      }
      isReconnectInFlight = true;
      reconnectAbortController = new AbortController();
      // The default transport does not surface its AbortController, but the
      // ChatRequestOptions allows passing a controller via the fetch shim if
      // we ever swap to a custom transport. For now, abort is best-effort —
      // the resume route closes cleanly on its own when the upstream
      // streamText finishes.
      return {
        api: `${api}/resume?sessionId=${encodeURIComponent(sessionId)}`,
      };
    },
  });

  const chat = new Chat<CopilotUIMessage>({
    id: sessionId ? `copilot-${sessionId}` : "copilot-draft",
    messages: [],
    transport,
    onFinish: (event) => {
      isReconnectInFlight = false;
      invalidateThreadQueries();
      onFinishRef.current({
        ...event,
        sessionId,
      });
    },
  });

  const entry: CopilotChatInstanceEntry = {
    abortReconnectStream,
    chat,
    onFinishRef,
    sessionId,
    touchedAt: now,
  };

  copilotChatInstanceCache.set(cacheKey, entry);
  evictOldChatInstances();
  return entry;
}

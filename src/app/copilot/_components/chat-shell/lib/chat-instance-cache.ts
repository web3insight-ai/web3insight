import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { CopilotUIMessage } from "~/ai/copilot-types";

interface CopilotChatInstanceEntry {
  chat: Chat<CopilotUIMessage>;
  sessionRef: { current: string | null };
  touchedAt: number;
}

interface GetOrCreateCopilotChatInstanceArgs {
  invalidateThreadQueries: () => void;
}

const MAX_CACHED_CHAT_INSTANCES = 4;
const copilotChatInstanceCache = new Map<string, CopilotChatInstanceEntry>();

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
  invalidateThreadQueries,
}: GetOrCreateCopilotChatInstanceArgs): CopilotChatInstanceEntry {
  const cacheKey = "web3insight";
  const now = Date.now();
  const existing = copilotChatInstanceCache.get(cacheKey);

  if (existing) {
    existing.touchedAt = now;
    return existing;
  }

  const sessionRef = { current: null as string | null };

  // Reason: DefaultChatTransport handles parsing the raw byte stream into
  // UIMessageChunk objects via parseJsonEventStream. We use
  // prepareSendMessagesRequest to inject the sessionId into the request body
  // so the API route knows which session to persist messages to.
  const transport = new DefaultChatTransport<CopilotUIMessage>({
    api: "/api/ai/chat",
    prepareSendMessagesRequest: ({ messages, body }) => {
      const sessionId = sessionRef.current;
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
  });

  const chat = new Chat<CopilotUIMessage>({
    id: "copilot-web3insight",
    messages: [],
    transport,
    onFinish: invalidateThreadQueries,
  });

  const nextEntry: CopilotChatInstanceEntry = {
    chat,
    sessionRef,
    touchedAt: now,
  };

  copilotChatInstanceCache.set(cacheKey, nextEntry);
  evictOldChatInstances();

  return nextEntry;
}

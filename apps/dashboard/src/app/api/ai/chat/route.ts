import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  readUIMessageStream,
  stepCountIs,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { and, eq, isNull } from "drizzle-orm";
import { pipeJsonRender } from "@json-render/core";
import { getModel } from "~/ai/repository/client";
import { web3InsightTools } from "~/ai/tools";
import { WEB3_JSON_RENDER_PROMPT } from "@/lib/json-render/catalog-prompt";
import { getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { copilot_messages, copilot_sessions } from "@/lib/db/schema/copilot";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";
import {
  clearActiveStream,
  clearStopRequest,
  getStopRequestedAt,
  publishResumeEvent,
  registerActiveStream,
} from "./stream-storage";

const SYSTEM_PROMPT = `You are Web3Insight AI, a specialized assistant for Web3 developer analytics.

You have access to real-time data about Web3 ecosystems, repositories, and developers.
Use the available tools to fetch accurate statistics before answering questions.

## Your Capabilities

**Platform Overview:**
- Get overall platform statistics (ecosystems, repos, developers)
- Count repositories and contributors by ecosystem

**Ecosystem Analytics:**
- Rank ecosystems by developer activity
- Track contributor growth trends (weekly/monthly)
- View new developer growth by quarter

**Repository Insights:**
- Top repositories by stars and contributor count
- Trending repositories (7-day star growth)
- Hot repositories (7-day developer activity)

**Developer Analytics:**
- Top contributors by commit activity
- Geographic distribution by country
- Individual developer profiles and statistics
- Developer's top repositories and recent activity
- Developer's Web3 ecosystem affiliations and scores

**Reports & Insights:**
- Annual Web3 developer ecosystem reports
- Public hackathon and event analysis

**Open Source Support:**
- Donation-enabled repositories (x402 protocol)

## Response Guidelines:
- Always use tools to get current data rather than making assumptions
- Present numbers clearly with context and comparisons
- For ecosystem comparisons, fetch data for each one
- Keep responses concise but informative
- Use markdown formatting for better readability
- When asked about a developer, provide comprehensive profile info

Available ecosystems: Ethereum, Solana, NEAR, OpenBuild, Starknet, and more.
Use "ALL" for global statistics across all ecosystems.

## Entity Linking:
When mentioning developers, ecosystems, or repositories in your response text, use markdown links so the UI can make them interactive:
- Developers: [username](/developer/username) e.g. [pseudoyu](/developer/pseudoyu)
- Ecosystems: [Ecosystem Name](/ecosystem/Name) e.g. [Ethereum](/ecosystem/Ethereum)
- Repositories: [owner/repo](/repository/owner/repo) e.g. [ethereum/go-ethereum](/repository/ethereum/go-ethereum)

## Response Formatting:
- The UI automatically renders rich visualizations for tool results (charts, tables, cards)
- Keep your text commentary concise — focus on insights and analysis, not repeating raw numbers
- Highlight key findings and notable trends
- Use entity links when referencing specific developers, ecosystems, or repositories

## Advanced Data Queries
For questions that existing tools cannot answer (custom time ranges, cross-ecosystem comparisons,
event type breakdowns, developer activity patterns, ad-hoc aggregations), use queryWeb3Data.
The sub-agent will generate and execute SQL against the analytics database.

## Data Visualization
${WEB3_JSON_RENDER_PROMPT}`;

export const maxDuration = 60;

const STOP_CHECK_INTERVAL_MS = 1_000;
const RESUME_TEXT_DELTA_FLUSH_MS = 40;
const RESUME_TEXT_DELTA_MAX_CHARS = 96;
const MAX_SESSION_TITLE_LENGTH = 120;

interface ChatRequestBody {
  messages: UIMessage[];
  sessionId?: string;
}

export async function POST(request: Request) {
  const { messages: rawMessages, sessionId } = (await request.json()) as ChatRequestBody;

  if (!rawMessages || rawMessages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Reason: AI SDK v6 convertToModelMessages calls `parts.map(...)` and
  // crashes on undefined. Guard against legacy clients or rehydrated rows
  // that omit `parts` — normalise them to an empty array so the request
  // surfaces a real model response instead of a 500.
  const messages = rawMessages.map((message) => {
    if (Array.isArray((message as { parts?: unknown }).parts)) {
      return message;
    }
    const legacy = message as { content?: unknown };
    if (typeof legacy.content === "string") {
      return {
        ...message,
        parts: [{ type: "text", text: legacy.content }],
      } as UIMessage;
    }
    return { ...message, parts: [] } as UIMessage;
  });

  // Reason: Resolve userId once so persistence functions can scope session
  // updates to the current user, preventing cross-user writes.
  const userId = sessionId ? await getCopilotUserId() : null;

  if (sessionId) {
    try {
      await persistUserMessage(sessionId, messages, userId);
    } catch (error) {
      console.error("Failed to persist user message:", error);
    }
  }

  const modelMessages = await convertToModelMessages(messages);

  // Reason: Wire a server-owned AbortController so we can stop streamText when
  // the client requests cancellation via POST /api/ai/chat/cancel.
  const abortController = new AbortController();
  const streamStartedAt = Date.now();

  let stopPolling = () => {
    /* assigned by startStopRequestPolling when sessionId is present */
  };

  if (sessionId) {
    stopPolling = startStopRequestPolling({
      abortController,
      sessionId,
      startedAt: streamStartedAt,
    });
  }

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: web3InsightTools,
    stopWhen: stepCountIs(5),
    abortSignal: abortController.signal,
  });

  const uiStream = result.toUIMessageStream({
    sendReasoning: false,
    sendSources: false,
    originalMessages: sessionId ? messages : undefined,
    generateMessageId: sessionId ? () => crypto.randomUUID() : undefined,
  });

  const transformedStream = pipeJsonRender(uiStream);

  if (!sessionId) {
    stopPolling();
    return createUIMessageStreamResponse({ stream: transformedStream });
  }

  // Reason: Clear any prior stream + stop state before claiming this one.
  clearStopRequest(sessionId);

  const streamId = `copilot-stream-${crypto.randomUUID()}`;
  registerActiveStream(sessionId, streamId);
  publishResumeEvent(streamId, { kind: "ready" });

  // Tee the transformed stream three ways:
  //   1. clientStream   — returned to the browser
  //   2. persistStream  — drained by persistAssistantFromStream
  //   3. resumeStream   — fed into the in-memory resume buffer for reconnects
  const [clientStream, sideEffectStream] = transformedStream.tee();
  const [persistStream, resumeStream] = sideEffectStream.tee();

  const persistPromise = persistAssistantFromStream(
    persistStream,
    sessionId,
    messages,
    userId,
  )
    .catch((persistError) => {
      console.error("Failed to persist assistant message:", persistError);
    })
    .finally(() => {
      stopPolling();
      clearActiveStream(sessionId);
      clearStopRequest(sessionId);
    });

  void publishResumeEvents({ sessionId, stream: resumeStream, streamId }).catch(
    (publishError) => {
      console.error(
        "[copilot] Failed to publish resume events:",
        { sessionId, streamId },
        publishError,
      );
    },
  );

  // Defer the response close until persistence settles so a fast tab-close
  // does not abort the assistant message mid-write.
  const closeDeferredStream = createCloseDeferredStream({
    onClose: () => persistPromise,
    stream: clientStream,
  });

  return createUIMessageStreamResponse({ stream: closeDeferredStream });
}

function isTextDeltaChunk(chunk: UIMessageChunk): chunk is UIMessageChunk & {
  delta: string;
  id: string;
  type: "text-delta";
} {
  return (
    chunk.type === "text-delta" &&
    "delta" in chunk &&
    typeof chunk.delta === "string" &&
    "id" in chunk &&
    typeof chunk.id === "string"
  );
}

/**
 * Coalesces consecutive text-delta chunks into ~96-char windows flushed
 * every 40ms so the resume buffer stays small even for long streams.
 */
function createBufferedResumeStream(stream: ReadableStream<UIMessageChunk>) {
  let pendingTextDelta:
    | (UIMessageChunk & { delta: string; id: string; type: "text-delta" })
    | null = null;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let isClosed = false;

  const clearFlushTimer = () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  };

  const flushPending = (
    controller: TransformStreamDefaultController<UIMessageChunk>,
  ) => {
    if (!pendingTextDelta) {
      return;
    }
    const chunk = pendingTextDelta;
    pendingTextDelta = null;
    clearFlushTimer();
    try {
      controller.enqueue(chunk);
    } catch {
      isClosed = true;
    }
  };

  const scheduleFlush = (
    controller: TransformStreamDefaultController<UIMessageChunk>,
  ) => {
    clearFlushTimer();
    flushTimer = setTimeout(() => {
      if (isClosed) {
        return;
      }
      flushPending(controller);
    }, RESUME_TEXT_DELTA_FLUSH_MS);
  };

  return stream.pipeThrough(
    new TransformStream<UIMessageChunk, UIMessageChunk>({
      flush(controller) {
        isClosed = true;
        clearFlushTimer();
        flushPending(controller);
      },
      transform(chunk, controller) {
        if (isTextDeltaChunk(chunk)) {
          if (pendingTextDelta?.id === chunk.id) {
            pendingTextDelta = {
              ...pendingTextDelta,
              delta: pendingTextDelta.delta + chunk.delta,
            };
          } else {
            flushPending(controller);
            pendingTextDelta = { ...chunk };
          }

          if (pendingTextDelta.delta.length >= RESUME_TEXT_DELTA_MAX_CHARS) {
            flushPending(controller);
          } else {
            scheduleFlush(controller);
          }
          return;
        }

        flushPending(controller);
        controller.enqueue(chunk);
      },
    }),
  );
}

async function publishResumeEvents({
  sessionId,
  stream,
  streamId,
}: {
  sessionId: string;
  stream: ReadableStream<UIMessageChunk>;
  streamId: string;
}) {
  const reader = createBufferedResumeStream(stream).getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        publishResumeEvent(streamId, { kind: "done" });
        return;
      }
      publishResumeEvent(streamId, { kind: "chunk", chunk: value });
    }
  } catch (error) {
    clearActiveStream(sessionId);
    throw error;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Ignore cancel errors during teardown.
    }
  }
}

function createCloseDeferredStream<T>({
  onClose,
  stream,
}: {
  onClose: () => Promise<unknown>;
  stream: ReadableStream<T>;
}) {
  const reader = stream.getReader();
  let closePromise: Promise<unknown> | null = null;

  const waitForClose = () => {
    closePromise ??= onClose();
    return closePromise;
  };

  return new ReadableStream<T>({
    async cancel(reason) {
      try {
        await reader.cancel(reason);
      } finally {
        // Reason: Client-side abort tears down the response but persistence
        // and resume tees still need to drain — await them before this stream
        // is fully released by the runtime.
        await waitForClose();
      }
    },
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          await waitForClose();
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        await waitForClose().catch(() => {
          // Persistence errors are already logged by the persistPromise owner.
        });
        controller.error(error);
      }
    },
  });
}

function startStopRequestPolling({
  abortController,
  sessionId,
  startedAt,
}: {
  abortController: AbortController;
  sessionId: string;
  startedAt: number;
}) {
  let disposed = false;
  let checking = false;

  const stop = () => {
    if (disposed) {
      return;
    }
    disposed = true;
    clearInterval(intervalId);
    abortController.signal.removeEventListener("abort", stop);
  };

  const check = () => {
    if (disposed || checking || abortController.signal.aborted) {
      return;
    }
    checking = true;
    try {
      const requestedAt = getStopRequestedAt(sessionId);
      if (requestedAt !== null && requestedAt >= startedAt) {
        abortController.abort();
      }
    } finally {
      checking = false;
    }
  };

  const intervalId = setInterval(check, STOP_CHECK_INTERVAL_MS);
  abortController.signal.addEventListener("abort", stop, { once: true });
  check();

  return stop;
}

/**
 * Persist the latest user message to the database and update session metadata.
 */
async function persistUserMessage(
  sessionId: string,
  messages: UIMessage[],
  userId: string | null,
): Promise<void> {
  const dbReady = await isCopilotDbReady();
  if (!dbReady) return;
  const db = getCopilotWriteDb();

  const lastUserMessage = findLastMessageByRole(messages, "user");
  if (!lastUserMessage) {
    return;
  }

  const parentId = resolveParentId(messages, lastUserMessage);

  await db
    .insert(copilot_messages)
    .values({
      message_id: lastUserMessage.id,
      session_id: sessionId,
      parent_id: parentId,
      role: "user",
      ui_message: lastUserMessage,
      created_at: new Date(),
    })
    .onConflictDoNothing({ target: copilot_messages.message_id });

  await db
    .update(copilot_sessions)
    .set({ last_active_at: new Date() })
    .where(
      and(
        eq(copilot_sessions.session_id, sessionId),
        userId
          ? eq(copilot_sessions.user_id, userId)
          : isNull(copilot_sessions.user_id),
      ),
    );

  const isFirstMessage = messages.filter((m) => m.role === "user").length === 1;
  if (isFirstMessage) {
    await deriveSessionTitle(sessionId, lastUserMessage, userId);
  }
}

async function persistAssistantFromStream(
  persistStream: ReadableStream<unknown>,
  sessionId: string,
  originalMessages: UIMessage[],
  userId: string | null,
): Promise<void> {
  let responseMessage: UIMessage | null = null;

  for await (const msg of readUIMessageStream({
    stream: persistStream as ReadableStream,
  })) {
    responseMessage = msg;
  }

  if (responseMessage) {
    await persistAssistantMessage(
      sessionId,
      originalMessages,
      responseMessage,
      userId,
    );
  }
}

async function persistAssistantMessage(
  sessionId: string,
  originalMessages: UIMessage[],
  responseMessage: UIMessage,
  userId: string | null,
): Promise<void> {
  const dbReady = await isCopilotDbReady();
  if (!dbReady) return;
  const db = getCopilotWriteDb();

  const lastUserMessage = findLastMessageByRole(originalMessages, "user");
  const parentId = lastUserMessage?.id ?? null;

  await db
    .insert(copilot_messages)
    .values({
      message_id: responseMessage.id,
      session_id: sessionId,
      parent_id: parentId,
      role: "assistant",
      ui_message: responseMessage,
      created_at: new Date(),
    })
    .onConflictDoNothing({ target: copilot_messages.message_id });

  await db
    .update(copilot_sessions)
    .set({ last_active_at: new Date() })
    .where(
      and(
        eq(copilot_sessions.session_id, sessionId),
        userId
          ? eq(copilot_sessions.user_id, userId)
          : isNull(copilot_sessions.user_id),
      ),
    );
}

function findLastMessageByRole(
  messages: UIMessage[],
  role: "user" | "assistant",
): UIMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === role) {
      return messages[i];
    }
  }
  return undefined;
}

function resolveParentId(
  messages: UIMessage[],
  currentMessage: UIMessage,
): string | null {
  const idx = messages.indexOf(currentMessage);
  if (idx <= 0) {
    return null;
  }
  return messages[idx - 1].id;
}

async function deriveSessionTitle(
  sessionId: string,
  userMessage: UIMessage,
  userId: string | null,
): Promise<void> {
  const textParts = (userMessage.parts ?? [])
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text);

  const rawText = textParts.join(" ").trim();
  if (!rawText) {
    return;
  }

  const title =
    rawText.length > MAX_SESSION_TITLE_LENGTH
      ? rawText.slice(0, MAX_SESSION_TITLE_LENGTH - 3) + "..."
      : rawText;
  const db = getCopilotWriteDb();

  await db
    .update(copilot_sessions)
    .set({ title })
    .where(
      and(
        eq(copilot_sessions.session_id, sessionId),
        isNull(copilot_sessions.title),
        userId
          ? eq(copilot_sessions.user_id, userId)
          : isNull(copilot_sessions.user_id),
      ),
    );
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

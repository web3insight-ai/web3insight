import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  readUIMessageStream,
  stepCountIs,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import { getModel } from "~/ai/repository/client";
import { web3InsightTools } from "~/ai/tools";
import { WEB3_JSON_RENDER_PROMPT } from "@/lib/json-render/catalog-prompt";
import { getCopilotWriteDb } from "@/lib/db/copilot-db";
import { isCopilotDbReady } from "@/lib/db/copilot-init";
import { getCopilotUserId } from "@/lib/auth/copilot-auth";

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

interface ChatRequestBody {
  messages: UIMessage[];
  sessionId?: string;
}

export async function POST(request: Request) {
  const { messages, sessionId } = (await request.json()) as ChatRequestBody;

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Reason: Resolve userId once so persistence functions can scope session
  // updates to the current user, preventing cross-user writes.
  const userId = sessionId ? await getCopilotUserId() : null;

  // Persist the latest user message if sessionId is provided
  if (sessionId) {
    try {
      await persistUserMessage(sessionId, messages, userId);
    } catch (error) {
      // Reason: Log but don't block the chat stream on persistence failure
      console.error("Failed to persist user message:", error);
    }
  }

  // Convert UI messages to model messages
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: web3InsightTools,
    stopWhen: stepCountIs(5),
  });

  // Reason: originalMessages + generateMessageId are REQUIRED for persistence.
  // Without them, the SDK assigns message.id = "" (empty string), and the
  // ON CONFLICT DO NOTHING clause silently skips every insert after the first.
  const uiStream = result.toUIMessageStream({
    sendReasoning: false,
    sendSources: false,
    originalMessages: sessionId ? messages : undefined,
    generateMessageId: sessionId ? () => crypto.randomUUID() : undefined,
  });

  // Reason: pipeJsonRender transforms the raw UIMessage stream so that JSONL
  // spec patches emitted by the LLM are converted into data-spec parts that
  // the client can render via <CopilotJsonRenderer>.
  const transformedStream = pipeJsonRender(uiStream);

  if (sessionId) {
    // Reason: We tee the TRANSFORMED stream so that the persisted UIMessage
    // contains data-spec parts (not raw ```spec fences). The onFinish callback
    // fires pre-transform and would persist raw JSONL text instead.
    const [clientStream, persistStream] = transformedStream.tee();

    void persistAssistantFromStream(persistStream, sessionId, messages, userId);

    return createUIMessageStreamResponse({ stream: clientStream });
  }

  return createUIMessageStreamResponse({ stream: transformedStream });
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

  // Determine parentId from the message chain
  const parentId = resolveParentId(messages, lastUserMessage);

  await db
    .insertInto("api.copilot_messages")
    .values({
      message_id: lastUserMessage.id,
      session_id: sessionId,
      parent_id: parentId,
      role: "user",
      ui_message: JSON.stringify(lastUserMessage),
      created_at: new Date(),
    })
    .onConflict((oc) => oc.column("message_id").doNothing())
    .execute();

  // Reason: Scope session update to the current user to prevent cross-user writes
  let sessionUpdate = db
    .updateTable("api.copilot_sessions")
    .set({ last_active_at: new Date() })
    .where("session_id", "=", sessionId);

  if (userId) {
    sessionUpdate = sessionUpdate.where("user_id", "=", userId);
  } else {
    sessionUpdate = sessionUpdate.where("user_id", "is", null);
  }

  await sessionUpdate.execute();

  // Derive a title from the first user message if the session has no title yet
  const isFirstMessage = messages.filter((m) => m.role === "user").length === 1;
  if (isFirstMessage) {
    await deriveSessionTitle(sessionId, lastUserMessage, userId);
  }
}

/**
 * Consume the tee'd persist stream to build the post-transform UIMessage,
 * then persist it. Runs as a background task alongside the client stream.
 *
 * Reason: We must persist from the post-pipeJsonRender stream so that
 * data-spec parts (charts/tables) are included in the stored UIMessage.
 * The onFinish callback fires pre-transform and would store raw ```spec fences.
 */
async function persistAssistantFromStream(
  persistStream: ReadableStream<unknown>,
  sessionId: string,
  originalMessages: UIMessage[],
  userId: string | null,
): Promise<void> {
  try {
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
  } catch (error) {
    console.error("Failed to persist assistant message:", error);
  }
}

/**
 * Persist the assistant response to the database.
 */
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
    .insertInto("api.copilot_messages")
    .values({
      message_id: responseMessage.id,
      session_id: sessionId,
      parent_id: parentId,
      role: "assistant",
      ui_message: JSON.stringify(responseMessage),
      created_at: new Date(),
    })
    .onConflict((oc) => oc.column("message_id").doNothing())
    .execute();

  // Reason: Scope session update to the current user to prevent cross-user writes
  let sessionUpdate = db
    .updateTable("api.copilot_sessions")
    .set({ last_active_at: new Date() })
    .where("session_id", "=", sessionId);

  if (userId) {
    sessionUpdate = sessionUpdate.where("user_id", "=", userId);
  } else {
    sessionUpdate = sessionUpdate.where("user_id", "is", null);
  }

  await sessionUpdate.execute();
}

/**
 * Find the last message with a given role in the messages array.
 */
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

/**
 * Resolve the parentId for a message by finding the previous message in the chain.
 */
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

/**
 * Derive a short title from the first user message and update the session.
 */
async function deriveSessionTitle(
  sessionId: string,
  userMessage: UIMessage,
  userId: string | null,
): Promise<void> {
  // Reason: Extract text content from the UIMessage parts to create a title.
  // We truncate to 100 chars for a reasonable session title.
  const textParts = (userMessage.parts ?? [])
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text);

  const rawText = textParts.join(" ").trim();
  if (!rawText) {
    return;
  }

  const title = rawText.length > 100 ? rawText.slice(0, 97) + "..." : rawText;
  const db = getCopilotWriteDb();

  let query = db
    .updateTable("api.copilot_sessions")
    .set({ title })
    .where("session_id", "=", sessionId)
    .where("title", "is", null);

  if (userId) {
    query = query.where("user_id", "=", userId);
  } else {
    query = query.where("user_id", "is", null);
  }

  await query.execute();
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

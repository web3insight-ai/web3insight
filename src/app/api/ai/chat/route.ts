import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { getModel } from "~/ai/repository/client";
import { web3InsightTools } from "~/ai/tools";

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
Use "ALL" for global statistics across all ecosystems.`;

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: UIMessage[] };

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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

  return result.toUIMessageStreamResponse();
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

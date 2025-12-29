import { streamText, stepCountIs } from "ai";
import { getModel } from "~/ai/repository/client";
import { web3InsightTools } from "~/ai/tools";

const SYSTEM_PROMPT = `You are Web3Insight AI, a specialized assistant for Web3 developer analytics.

You have access to real-time data about Web3 ecosystems, repositories, and developers.
Use the available tools to fetch accurate statistics before answering questions.

When responding:
- Always use tools to get current data rather than making assumptions
- Present numbers clearly and provide context
- If comparing ecosystems, fetch data for each one
- Keep responses concise but informative
- Use markdown formatting for better readability

Available ecosystems include: Ethereum, Solana, NEAR, OpenBuild, Starknet, and more.
Use "ALL" to get global statistics across all ecosystems.`;

export const maxDuration = 60;

export async function POST(request: Request) {
  const { prompt } = await request.json();

  if (!prompt?.trim()) {
    return new Response(JSON.stringify({ error: "Prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    prompt,
    tools: web3InsightTools,
    stopWhen: stepCountIs(5),
  });

  return result.toTextStreamResponse();
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

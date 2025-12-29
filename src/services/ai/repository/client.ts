import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/env";

const openai = createOpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
  // Use 'compatible' mode for OpenAI-compatible proxies (burn.hair, etc.)
  // This uses the Chat Completions API instead of the Responses API
  compatibility: "compatible",
});

export function getModel() {
  return openai(env.OPENAI_MODEL);
}

export { openai };

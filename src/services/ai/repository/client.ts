import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/env";

const openai = createOpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
});

export function getModel() {
  // Use openai.chat() to force Chat Completions API (/v1/chat/completions)
  // instead of the default Responses API (/v1/responses) which proxies don't support
  return openai.chat(env.OPENAI_MODEL);
}

export { openai };

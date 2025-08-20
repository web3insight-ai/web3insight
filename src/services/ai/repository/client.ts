import { createOpenAI } from "@ai-sdk/openai";
import { env } from "@/env";

const openai = createOpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
});

export { openai };

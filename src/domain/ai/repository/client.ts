import HttpClient from "@/clients/http/HttpClient";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const httpClient = new HttpClient({
  baseUrl: `${process.env.AI_API_URL}/api/v1`,
  headers: {
    Authorization: `Bearer ${process.env.AI_API_TOKEN}`,
  },
});

export { openai };
export default httpClient;

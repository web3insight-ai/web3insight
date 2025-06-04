import { fetchAnalyzedStatisticsQuery } from "~/ai/repository";
import { createServerAction, createPreflightAction } from "../utils";
import { generateFailedResponse } from "@/clients/http";
import { json } from "@remix-run/node";

export const action = createServerAction("POST", async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return json(generateFailedResponse("Method not allowed", 405), {
      status: 405,
    });
  }
  const formData = await request.formData();
  const res = await fetchAnalyzedStatisticsQuery({
    query: formData.get("query") as string,
  });

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*", // 必须为前端可读流设置 CORS
    },
  });
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();

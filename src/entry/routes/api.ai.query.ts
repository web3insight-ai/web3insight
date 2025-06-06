import { fetchAnalyzedStatistics } from "~/ai/repository";
import { createServerAction, createPreflightAction } from "../utils";

export const action = createServerAction("POST", async ({ request }) => {
  const formData = await request.formData();
  const res = await fetchAnalyzedStatistics({
    query: formData.get("query") as string,
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
});

// For preflight requests (important for CORS)
export const loader = createPreflightAction();

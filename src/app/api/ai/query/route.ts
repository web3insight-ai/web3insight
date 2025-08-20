import { fetchAnalyzedStatistics } from "~/ai/repository";

export async function POST(request: Request) {
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
}

// For preflight requests (important for CORS)
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

import { isServerSide } from "@/clients/http";

// async function fetchAnalyzedStatistics({
//   query,
// }: {
//   query: string;
// }): Promise<ResponseResult> {
//   return httpClient.post("/stream_statistic", {
//     query,
//   });
// }

async function fetchAnalyzedStatistics({ query }: { query: string }) {
  return fetch(`${process.env.AI_API_URL}/api/v1/stream_statistic`, {
    method: "POST",
    body: JSON.stringify({ query }),
    headers: {
      Authorization: `Bearer ${process.env.AI_API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
  });
}

async function fetchAnalyzedStatisticsQuery({ query }: { query: string }) {
  if (!isServerSide()) {
    return fetch("/api/ai/query", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        Authorization: `Bearer ${process.env.AI_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
    });
  }

  return fetchAnalyzedStatistics({ query });
}

export { fetchAnalyzedStatistics, fetchAnalyzedStatisticsQuery };

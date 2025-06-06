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

export { fetchAnalyzedStatistics };

import httpClient from "./client";

async function fetchDecentralizedActivityList(address: string) {
  return httpClient.get(`/decentralized/${address}`, {
    params: {
      limit: 50,
      action_limit: 10,
    },
  });
}

export { fetchDecentralizedActivityList };

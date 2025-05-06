import httpClient from "./client";

async function fetchUser(user: string) {
  return httpClient.get(`/users/${user}`);
}

async function fetchRepo(repo: string) {
  return httpClient.get(`/repo/${repo}`);
}

export { fetchUser, fetchRepo };

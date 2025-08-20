import type { ResponseResult } from "@/types";

import type { Repo, Event } from "../typing";
import httpClient from "./client";

async function fetchRepoList(login: string): Promise<ResponseResult<Repo[]>> {
  return httpClient.get(`/users/${login}/repos`);
}

async function fetchPublicEventList(login: string): Promise<ResponseResult<Event[]>> {
  return httpClient.get(`/users/${login}/events/public`, {
    params: {
      per_page: "20",
    },
  });
}

export { fetchRepoList, fetchPublicEventList };

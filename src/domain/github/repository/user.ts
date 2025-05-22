import type { ResponseResult } from "@/types";

import type { Repo } from "../typing";
import httpClient from "./client";

async function fetchRepoList(login: string): Promise<ResponseResult<Repo[]>> {
  return httpClient.get(`/users/${login}/repos`);
}

export { fetchRepoList };

import type { ResponseResult } from "@/types";

import type { GithubUser } from "../typing";

import httpClient from "./client";

async function fetchUser(user: string): Promise<ResponseResult<GithubUser>> {
  return httpClient.get(`/gh/users/${user}`);
}

async function fetchUserById(id: string | number): Promise<ResponseResult<GithubUser>> {
  return httpClient.get(`/gh/user/${id}`);
}

async function fetchRepo(repo: string) {
  return httpClient.get(`/gh/repo/${repo}`);
}

export { fetchUser, fetchUserById, fetchRepo };

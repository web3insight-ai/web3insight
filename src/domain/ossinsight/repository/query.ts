import type { ResponseResult } from "@/types";

import type { PersonalOverview } from "../typing";

import httpClient from "./client";

async function fetchPersonalOverview(userId: number): Promise<ResponseResult<PersonalOverview[]>> {
  return httpClient.get("/q/personal-overview", { params: { userId } });
}

export { fetchPersonalOverview };

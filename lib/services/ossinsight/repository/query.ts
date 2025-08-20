import type { ResponseResult } from "@/types";

import type { PersonalOverview, PersonalContributionTrend } from "../typing";

import httpClient from "./client";

async function fetchPersonalOverview(userId: number): Promise<ResponseResult<PersonalOverview[]>> {
  return httpClient.get("/q/personal-overview", { params: { userId: userId.toString() } });
}

async function fetchPersonalContributionTrends(userId: number): Promise<ResponseResult<PersonalContributionTrend[]>> {
  return httpClient.get("/q/personal-contribution-trends", { params: { userId: userId.toString() } });
}

export { fetchPersonalOverview, fetchPersonalContributionTrends };

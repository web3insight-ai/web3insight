import { type IRateLimiterRedisOptions, RateLimiterRedis } from "rate-limiter-flexible";

import type { DataValue, ResponseResult } from "@/types";
import { generateSuccessResponse, generateFailedResponse } from "@/clients/http";
import redis from "@/clients/redis";

import type { User as StrapiUser, StrapiQuery } from "../strapi";
import { createQuery, updateQuery, fetchQueryList, fetchQuery, fetchUserQueries, fetchPinnedQueries } from "../strapi/repository";
import { getSearchKeyword } from "../ai/repository";

import type { Query } from "./typing";
import { ErrorType, resolveQueryListResponseResult } from "./helper";

async function fetchList(params: Record<string, DataValue>): Promise<ResponseResult<Query[]>> {
  return resolveQueryListResponseResult(await fetchQueryList(params));
}

async function fetchOne(
  id: string,
  params?: Record<string, DataValue>,
): Promise<ResponseResult<StrapiQuery | null>> {
  return fetchQuery(id, params);
}

const limiterOpts: IRateLimiterRedisOptions = {
  storeClient: redis,
  duration: 60 * 60 * 24, // 1 day
};

const guestSearchLimiter = new RateLimiterRedis({
  ...limiterOpts,
  keyPrefix: "guest_search_limiter",
  points: 20,
});

const userSearchLimiter = new RateLimiterRedis({
  ...limiterOpts,
  keyPrefix: "user_search_limiter",
  points: 200,
});

async function insertOne(
  { user, ipAddress, query }: {
    user: StrapiUser | null;
    ipAddress: string | null;
    query: string;
  },
): Promise<ResponseResult<StrapiQuery | undefined>> {
  let searchLimiter = guestSearchLimiter;
  let key = ipAddress || "unknown";

  if (user) {
    searchLimiter = userSearchLimiter;
    key = user.id.toString();
  }

  try {
    await searchLimiter.consume(key, 1);
  } catch (e) {
    return {
      ...generateFailedResponse("Usage limit exceeded", 400),
      extra: { type: user ? ErrorType.ReachMaximized : ErrorType.SigninNeeded },
    };
  }

  if (query.length > 100) {
    return {
      ...generateFailedResponse("Query is too long", 400),
      extra: { type: ErrorType.Basic },
    };
  }

  const keyword = await getSearchKeyword(query);

  if (!keyword) {
    return {
      ...generateFailedResponse("Not supported yet", 400),
      extra: { type: ErrorType.Basic },
    };
  }

  // Create the query in Strapi
  try {
    const params: {
      query: string;
      keyboard?: string;
      userId?: number;
    } = { query, keyboard: keyword };

    // If the user is authenticated, link the query to their account
    if (user) {
      params.userId = user.id;
    }

    return createQuery(params);
  } catch (error) {
    return {
      ...generateFailedResponse("Failed to create query"),
      extra: { type: ErrorType.Basic },
    };
  }
}

async function updateOne(
  id: string,
  data?: {
    answer?: string;
    keyboard?: string;
  },
): Promise<ResponseResult<StrapiQuery>> {
  return updateQuery(id, data);
}

async function fetchPinnedList(): Promise<ResponseResult<Query[]>> {
  return resolveQueryListResponseResult(await fetchPinnedQueries());
}

async function fetchSearchedList(
  { userId, limit }: {
    userId: number;
    limit?: number;
  },
): Promise<ResponseResult<Query[]>> {
  return resolveQueryListResponseResult(await fetchUserQueries(userId, limit));
}

async function fetchListForUser(
  { user, limit }: {
    user: StrapiUser | null;
    limit?: number;
  },
): Promise<ResponseResult<{
  pinned: Query[];
  history: Query[];
}>> {
  const { data: pinned } = await fetchPinnedList();

  let history: Query[] = [];

  // Fetch user's query history from Strapi if user is logged in
  if (user && user.id) {
    history = (await fetchSearchedList({ userId: user.id, limit })).data;
  }

  return generateSuccessResponse({ pinned, history });
}

async function fetchOneWithUser(id: string): Promise<ResponseResult<StrapiQuery | null>> {
  return fetchOne(id, { populate: ['user'] });
}

export {
  fetchList, fetchOne, insertOne, updateOne,
  fetchPinnedList, fetchSearchedList, fetchListForUser,
  fetchOneWithUser,
};

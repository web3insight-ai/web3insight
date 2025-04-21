import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "./engine.server";

export const guestSearchLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "guest_search_limiter",
  points: 20,
  duration: 60 * 60 * 24, // 1 day
});

export const userSearchLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "user_search_limiter",
  points: 200,
  duration: 60 * 60 * 24, // 1 day
});

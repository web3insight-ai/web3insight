import { Redis } from "ioredis";
import { env } from "@/env";

const redis = new Redis(env.REDIS_URL as string);

export default redis;

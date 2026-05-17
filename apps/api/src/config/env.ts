import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * Server-side env schema for the Hono runtime. Replaces the NestJS ConfigModule.
 * Each app entry (api/hono.ts, api/cron/*.ts, api/inngest/[...slug].ts) imports
 * this module so misconfigured deploys fail at cold start instead of first request.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_URL_DIRECT: z.string().url().optional(),
    JWT_SECRET: z.string().min(32),
    DATA_API_TOKEN: z.string().optional(),
    GITHUB_TOKENS: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_BASE_URL: z
      .string()
      .url()
      .default('https://openrouter.ai/api/v1'),
    OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
    PRIVY_APP_ID: z.string().optional(),
    PRIVY_APP_SECRET: z.string().optional(),
    INNGEST_SIGNING_KEY: z.string().optional(),
    INNGEST_EVENT_KEY: z.string().optional(),
    CRON_SECRET: z.string().min(32).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  // Reason: CI and local typecheck runs shouldn't need every secret; validation still
  // happens at runtime on the Vercel function cold start.
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.env.NODE_ENV === 'test',
});

export type Env = typeof env;

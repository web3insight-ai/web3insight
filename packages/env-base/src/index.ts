import { z } from 'zod';

/**
 * Shared env schema fragments used by all Next.js apps.
 * Apps extend with their own server/client vars via `createEnv({ extends: [baseEnv()] })`.
 */
export const baseServerSchema = {
  DATA_API_URL: z.string().url().default('https://api.web3insight.ai'),
  DATA_API_TOKEN: z.string().min(1),
  HTTP_TIMEOUT: z.coerce.number().int().positive().default(30000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
} as const;

export const baseClientSchema = {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  NEXT_PUBLIC_UMAMI_URL: z.string().url().optional(),
} as const;

export const baseRuntimeEnv = (env: NodeJS.ProcessEnv) => ({
  DATA_API_URL: env.DATA_API_URL,
  DATA_API_TOKEN: env.DATA_API_TOKEN,
  HTTP_TIMEOUT: env.HTTP_TIMEOUT,
  NODE_ENV: env.NODE_ENV,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  NEXT_PUBLIC_UMAMI_URL: env.NEXT_PUBLIC_UMAMI_URL,
});

export { z };

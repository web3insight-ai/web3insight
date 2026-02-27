import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Data API configuration
    DATA_API_URL: z.string().url().default("https://api.web3insight.ai"),
    DATA_API_TOKEN: z.string().min(1),

    // External service URLs
    OSSINSIGHT_URL: z.string().url().default("https://api.ossinsight.io"),

    // AI Services (OpenAI-compatible API)
    OPENAI_BASE_URL: z.string().url().default("https://burn.hair/v1"),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().default("gpt-4o"),

    // HTTP timeout configuration (in milliseconds)
    HTTP_TIMEOUT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive())
      .default("30000"),

    // Copilot database (PostgreSQL connection strings)
    // Reason: Write connection uses admin account, read connection uses read-only account
    COPILOT_DATABASE_URL: z.string().url().optional(),
    COPILOT_DATABASE_WRITE_URL: z.string().url().optional(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Privy configuration (client-side)
    NEXT_PUBLIC_PRIVY_APP_ID: z.string().min(1).optional(),
    // Umami Analytics configuration
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1).optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server vars
    DATA_API_URL: process.env.DATA_API_URL,
    DATA_API_TOKEN: process.env.DATA_API_TOKEN,
    OSSINSIGHT_URL: process.env.OSSINSIGHT_URL,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    HTTP_TIMEOUT: process.env.HTTP_TIMEOUT,
    COPILOT_DATABASE_URL: process.env.COPILOT_DATABASE_URL,
    COPILOT_DATABASE_WRITE_URL: process.env.COPILOT_DATABASE_WRITE_URL,
    NODE_ENV: process.env.NODE_ENV,

    // Client vars
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

// Helper functions for backward compatibility
export function getVar(key: keyof typeof env) {
  return env[key] || "";
}

export function getHttpTimeout() {
  return env.HTTP_TIMEOUT;
}

// Environment detection helpers
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";

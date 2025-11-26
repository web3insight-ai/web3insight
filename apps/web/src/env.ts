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

    // HTTP timeout configuration (in milliseconds)
    HTTP_TIMEOUT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().positive())
      .default("30000"),

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
    // Umami Analytics configuration
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server vars
    DATA_API_URL: process.env.DATA_API_URL,
    DATA_API_TOKEN: process.env.DATA_API_TOKEN,
    HTTP_TIMEOUT: process.env.HTTP_TIMEOUT,
    NODE_ENV: process.env.NODE_ENV,

    // Client vars
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

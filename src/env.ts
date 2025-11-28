import { z } from "zod"

const envSchema = z.object({
  DATA_API_URL: z.string().url().default("https://api.web3insight.ai"),
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  PRIVY_APP_SECRET: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.warn("⚠️ Some environment variables are missing:", parsedEnv.error.format())
  console.warn("The app may not function properly without proper environment configuration")
}

// Export environment variables with safe defaults
export const env = {
  DATA_API_URL: process.env.DATA_API_URL || "https://api.web3insight.ai",
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "",
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "",
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET || "",
}

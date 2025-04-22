/**
 * Centralized access to environment variables
 */

const vars: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Strapi configuration
  STRAPI_API_URL: process.env.STRAPI_API_URL || "https://api.web3insights.app",
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "default-secret-change-me",
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || "",
  // OpenAI configuration
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  REDIS_URL: process.env.REDIS_URL || "",
  RSS3_DSL_URL: process.env.RSS3_DSL_URL || "",
  OPENDIGGER_URL: process.env.OPENDIGGER_URL || "",
  OSSINSIGHT_URL: process.env.OSSINSIGHT_URL || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  RPC_URL: process.env.RPC_URL || "",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
};

function getVar(key: string) {
  return vars[key];
}

// Check if important environment variables are set
function validateEnvironment(): boolean {
  const requiredVars = ["STRAPI_API_URL", "STRAPI_API_TOKEN", "DATABASE_URL"].map(name => ({ name, value: getVar(name) }));

  let valid = true;

  for (const { name, value } of requiredVars) {
    if (!value) {
      console.error(`Environment variable ${name} is not set!`);
      valid = false;
    }
  }

  return valid;
}

export { getVar, validateEnvironment };

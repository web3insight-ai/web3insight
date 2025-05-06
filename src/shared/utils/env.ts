/**
 * Centralized access to environment variables
 */

import type { DataValue } from "../types";

try {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test = process.env;
} catch(err) {
  window.process = { env: {} } as DataValue;
}

const vars: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  API_BASE_URL: process.env.API_BASE_URL || "",
  // Strapi configuration
  STRAPI_API_URL: process.env.STRAPI_API_URL || "https://api.web3insights.app",
  STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN || "",
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "default-secret-change-me",
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || "",
  REDIS_URL: process.env.REDIS_URL || "",
  OPENDIGGER_URL: process.env.OPENDIGGER_URL || "",
};

function getVar(key: string) {
  return vars[key] || "";
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

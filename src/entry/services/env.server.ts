/**
 * Centralized access to environment variables
 */

// Strapi configuration
export const STRAPI_API_URL = process.env.STRAPI_API_URL || "https://api.web3insights.app";
export const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || "";

// Session configuration
export const SESSION_SECRET = process.env.SESSION_SECRET || "s3cr3t";

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || "";

// OpenAI configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Check if important environment variables are set
export function validateEnvironment(): boolean {
  const requiredVars = [
    { name: "STRAPI_API_URL", value: STRAPI_API_URL },
    { name: "STRAPI_API_TOKEN", value: STRAPI_API_TOKEN },
    { name: "DATABASE_URL", value: DATABASE_URL },
  ];

  let valid = true;

  for (const { name, value } of requiredVars) {
    if (!value) {
      console.error(`Environment variable ${name} is not set!`);
      valid = false;
    }
  }

  return valid;
}
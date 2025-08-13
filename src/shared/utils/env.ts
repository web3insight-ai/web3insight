/**
 * Centralized access to environment variables
 */

import type { DataValue } from "../types";

// Environment variables are handled by Vite/Remix automatically
// No need to manually load dotenv in development

try {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const test = process.env;
} catch(err) {
  window.process = { env: {} } as DataValue;
}

// Helper function to get environment variable from both server and client
function getEnvVar(key: string): string {
  // In browser, try import.meta.env first, then process.env
  if (typeof window !== 'undefined') {
    // Client-side (browser)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as Record<string, string>)[key] || "";
    }
    // Fallback to process.env if available
    return (window as { process?: { env?: Record<string, string> } }).process?.env?.[key] || "";
  }

  // Server-side (Node.js)
  return process.env[key] || "";
}

// Determine if we're in development mode
const isDevelopment = getEnvVar("NODE_ENV") === "development";

const vars: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  API_BASE_URL: getEnvVar("API_BASE_URL"),
  // Data API configuration
  DATA_API_URL: getEnvVar("DATA_API_URL") || "https://api.web3insight.ai",
  DATA_API_TOKEN: getEnvVar("DATA_API_TOKEN"),
  // Session configuration
  SESSION_SECRET: getEnvVar("SESSION_SECRET") || "default-secret-change-me",
  // Database configuration
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  // WalletConnect configuration
  WALLETCONNECT_PROJECT_ID: getEnvVar("WALLETCONNECT_PROJECT_ID"),
  // Origin SDK configuration
  ORIGIN_API_URL: getEnvVar("VITE_ORIGIN_API_URL"),
  ORIGIN_CLIENT_ID: getEnvVar("VITE_ORIGIN_CLIENT_ID"),
  ORIGIN_SUBGRAPH_URL: getEnvVar("VITE_ORIGIN_SUBGRAPH_URL"),
  // Environment detection
  NODE_ENV: getEnvVar("NODE_ENV") || "development",
  IS_DEVELOPMENT: isDevelopment,
  // HTTP timeout configuration (in milliseconds)
  HTTP_TIMEOUT: parseInt(getEnvVar("HTTP_TIMEOUT") || "30000", 10), // Default: 30 seconds
};

function getVar(key: string) {
  return vars[key] || "";
}

function getHttpTimeout() {
  return vars.HTTP_TIMEOUT;
}

// Check if important environment variables are set
function validateEnvironment(): boolean {
  const requiredVars = ["DATA_API_URL", "DATABASE_URL"].map(name => ({ name, value: getVar(name) }));

  let valid = true;

  for (const { name, value } of requiredVars) {
    if (!value) {
      console.error(`Environment variable ${name} is not set!`);
      valid = false;
    }
  }

  // Additional validation for production environment
  if (!isDevelopment) {
    const dataApiUrl = getVar("DATA_API_URL");
    if (dataApiUrl.includes("localhost")) {
      console.error("Production environment should not use localhost URLs!");
      console.error(`DATA_API_URL is set to: ${dataApiUrl}`);
      valid = false;
    }
  }

  return valid;
}

export { getVar, getHttpTimeout, validateEnvironment };

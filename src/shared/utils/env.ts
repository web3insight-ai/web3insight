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

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

const vars: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  API_BASE_URL: process.env.API_BASE_URL || "",
  // Data API configuration  
  DATA_API_URL: process.env.DATA_API_URL || "https://api.web3insight.ai",
  DATA_API_TOKEN: process.env.DATA_API_TOKEN || "",
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || "default-secret-change-me",
  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || "",
  // WalletConnect configuration
  WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID || "",
  // Environment detection
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: isDevelopment,
  // HTTP timeout configuration (in milliseconds)
  HTTP_TIMEOUT: parseInt(process.env.HTTP_TIMEOUT || "30000", 10), // Default: 30 seconds
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

/**
 * Centralized access to environment variables
 */



// Environment variables are handled by Next.js automatically
// No need to manually load dotenv in development

// Helper function to get environment variable from both server and client
function getEnvVar(key: string): string {
  // Next.js handles environment variables through process.env
  // Client-side variables must be prefixed with NEXT_PUBLIC_
  return process.env[key] || "";
}

// Determine if we're in development mode
const isDevelopment = getEnvVar("NODE_ENV") === "development";

const vars: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  API_BASE_URL: getEnvVar("API_BASE_URL"),
  // Data API configuration
  DATA_API_URL: getEnvVar("DATA_API_URL") || "https://api.web3insight.ai",
  DATA_API_TOKEN: getEnvVar("DATA_API_TOKEN"),
  // External service URLs
  OPENDIGGER_URL: getEnvVar("OPENDIGGER_URL") || "https://oss.x-lab.info/open_digger",
  OSSINSIGHT_URL: getEnvVar("OSSINSIGHT_URL") || "https://api.ossinsight.io",
  RSS3_DSL_URL: getEnvVar("RSS3_DSL_URL"),
  // Session configuration
  SESSION_SECRET: getEnvVar("SESSION_SECRET") || "default-secret-change-me",
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
  const requiredVars = ["DATA_API_URL"].map(name => ({ name, value: getVar(name) }));

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

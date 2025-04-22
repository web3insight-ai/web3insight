import { getVar } from "@/utils/env";

const STRAPI_API_URL = getVar('STRAPI_API_URL');
const STRAPI_API_TOKEN = getVar('STRAPI_API_TOKEN');

/**
 * Helper function to construct Strapi API URLs correctly
 * @param endpoint - The endpoint path (without leading slash)
 * @returns The full URL to the Strapi endpoint
 */
export function getStrapiUrl(endpoint: string): string {
  // Make sure the base URL doesn't end with a slash
  const baseUrl = STRAPI_API_URL.endsWith('/')
    ? STRAPI_API_URL.slice(0, -1)
    : STRAPI_API_URL;

  // Make sure endpoint doesn't start with a slash
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint.slice(1)
    : endpoint;

  // Construct the full URL
  return `${baseUrl}/${cleanEndpoint}`;
}

/**
 * Helper function to check if Strapi is accessible
 * @returns Promise resolving to a boolean indicating if Strapi is accessible
 */
export async function checkStrapiConnection(): Promise<boolean> {
  try {
    // Ping the base endpoint or a known working endpoint
    const response = await fetch(STRAPI_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Strapi connection check response status:", response.status);
    return response.status !== 404; // Consider any response that's not 404 as "connected"
  } catch (error) {
    console.error("Error connecting to Strapi:", error);
    return false;
  }
}

/**
 * Create default headers for Strapi API requests
 * @param includeAuth - Whether to include the auth token
 * @returns Headers object
 */
export function getStrapiHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth && STRAPI_API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  return headers;
}

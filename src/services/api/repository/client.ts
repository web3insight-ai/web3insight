import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient, {
  type RequestConfigWithTimeout,
  type ResponseInterceptor,
} from "@/clients/http/HttpClient";
import { env } from "@/env";
import type { DataValue } from "@/types";

// Create HTTP client with base configuration
const baseHttpClient = new HttpClient({
  baseURL: env.DATA_API_URL,
  headers: {
    Authorization: `Bearer ${env.DATA_API_TOKEN}`,
  },
  normalizer: normalizeRestfulResponse,
});

// Get centralized timeout value
const httpTimeout = env.HTTP_TIMEOUT;

// Create wrapper with timeout configuration
const httpClient = {
  get: (url: string, config: RequestConfigWithTimeout = {}) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.get(url, config);
  },
  post: (
    url: string,
    data?: Record<string, DataValue>,
    config: RequestConfigWithTimeout = {},
  ) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.post(url, data, config);
  },
  put: (
    url: string,
    data?: Record<string, DataValue>,
    config: RequestConfigWithTimeout = {},
  ) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.put(url, data, config);
  },
  use: (interceptor: ResponseInterceptor) => {
    // Delegate to the base HTTP client
    return baseHttpClient.use(interceptor);
  },
};

export default httpClient;

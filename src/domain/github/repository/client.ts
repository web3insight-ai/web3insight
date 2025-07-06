import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";
import { getHttpTimeout } from "@/utils/env";
import type { DataValue } from "@/types";

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseUrl: `${process.env.DATA_API_URL}/v1/github/proxy`,
  headers: {
    Authorization: `Bearer ${process.env.DATA_API_TOKEN}`,
  },
  normalizer: normalizeRestfulResponse,
});

// Type definitions for the wrapper
interface RequestConfigWithTimeout {
  signal?: AbortSignal;
  [key: string]: unknown;
}

// Get centralized timeout value
const httpTimeout = getHttpTimeout();

// Create wrapper with timeout configuration
const httpClient = {
  get: (url: string, config: RequestConfigWithTimeout = {}) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.get(url, config);
  },
  post: (url: string, data?: Record<string, DataValue>, config: RequestConfigWithTimeout = {}) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.post(url, data, config);
  },
  put: (url: string, data?: Record<string, DataValue>, config: RequestConfigWithTimeout = {}) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.put(url, data, config);
  },
  use: (interceptor: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // Delegate to the base HTTP client
    return baseHttpClient.use(interceptor);
  },
};

export default httpClient;

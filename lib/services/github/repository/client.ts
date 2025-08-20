import { normalizeRestfulResponse } from "@/clients/http";
import HttpClient, {
  type RequestConfigWithTimeout,
} from "@/clients/http/HttpClient";

import type { DataValue } from "@/types";
import { env, getHttpTimeout } from "@/env";

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseURL: `${env.DATA_API_URL}/v1/github/proxy`,
  headers: {
    Authorization: `Bearer ${env.DATA_API_TOKEN}`,
  },
  normalizer: normalizeRestfulResponse,
});

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
  post: (
    url: string,
    data?: Record<string, DataValue>,
    config: RequestConfigWithTimeout = {}
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
    config: RequestConfigWithTimeout = {}
  ) => {
    // Add longer timeout if no signal is provided
    if (!config.signal) {
      config.signal = AbortSignal.timeout(httpTimeout);
    }
    return baseHttpClient.put(url, data, config);
  },
  use: (interceptor: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Delegate to the base HTTP client
    return baseHttpClient.use(interceptor);
  },
};

export default httpClient;

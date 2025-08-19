import HttpClient, { type RequestConfigWithTimeout } from "@/clients/http/HttpClient";
import { getHttpTimeout, getVar } from "@/utils/env";
import type { DataValue } from "@/types";

// Create base HTTP client
const baseHttpClient = new HttpClient({ baseURL: getVar("RSS3_DSL_URL") });

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

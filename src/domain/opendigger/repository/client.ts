import type { DataValue, ResponseResult } from "@/types";
import { getHttpTimeout, getVar } from "@/utils/env";
import HttpClient, { type RequestConfigWithTimeout } from "@/clients/http/HttpClient";

// OpenDigger API returns raw data directly, so we need to normalize it
function normalizeResponse<VT extends DataValue = DataValue>(jsonData: unknown): ResponseResult<VT> {
  if (jsonData !== null && jsonData !== undefined) {
    // OpenDigger API returns data directly (not wrapped in success/data structure)
    // So we normalize it to our expected ResponseResult format
    return {
      success: true,
      code: "200",
      message: "OpenDigger data retrieved successfully",
      data: jsonData as VT,
      extra: {},
    };
  }

  return {
    success: false,
    code: "500",
    message: "No data received from OpenDigger API",
    data: undefined as VT,
    extra: {},
  };
}

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseURL: getVar("OPENDIGGER_URL"),
  normalizer: normalizeResponse,
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

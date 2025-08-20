import HttpClient, {
  type RequestConfigWithTimeout,
} from "@/clients/http/HttpClient";
import { env } from "@/env";
import type { DataValue, ResponseResult } from "@/types";

// OSS Insight API returns data in a specific structure, so we need to normalize it
function normalizeResponse<VT extends DataValue = DataValue>(
  apiResponse: unknown
): ResponseResult<VT> {
  // OSS Insight API returns: { data: actualData, requestedAt, finishedAt, etc. }
  if (
    apiResponse &&
    apiResponse.data !== undefined &&
    apiResponse.data !== null
  ) {
    return {
      success: true,
      code: "200",
      message: "OSS Insight data retrieved successfully",
      data: apiResponse.data as VT,
      extra: {
        requestedAt: apiResponse.requestedAt,
        finishedAt: apiResponse.finishedAt,
        expiresAt: apiResponse.expiresAt,
      },
    };
  }

  return {
    success: false,
    code: "404",
    message: apiResponse?.message || "No data received from OSS Insight API",
    data: undefined as VT,
    extra: {},
  };
}

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseURL: env.OSSINSIGHT_URL,
  normalizer: normalizeResponse,
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

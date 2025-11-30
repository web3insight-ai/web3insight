import HttpClient, {
  type RequestConfigWithTimeout,
  type ResponseInterceptor,
} from "@/clients/http/HttpClient";
import { env } from "@/env";
import type { DataValue, ResponseResult } from "@/types";

// Define the shape expected from OSS Insight API
interface OssInsightApiResponse {
  data?: unknown;
  message?: string;
  requestedAt?: string;
  finishedAt?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

// OSS Insight API returns data in a specific structure, so we need to normalize it
function normalizeResponse<VT extends DataValue = DataValue>(
  apiResponse: unknown,
): ResponseResult<VT> {
  const resp = apiResponse as OssInsightApiResponse | null | undefined;
  if (
    resp &&
    typeof resp === "object" &&
    "data" in resp &&
    resp.data !== undefined &&
    resp.data !== null
  ) {
    return {
      success: true,
      code: "200",
      message: "OSS Insight data retrieved successfully",
      data: resp.data as VT,
      extra: {
        requestedAt: resp.requestedAt,
        finishedAt: resp.finishedAt,
        expiresAt: resp.expiresAt,
      },
    };
  }

  return {
    success: false,
    code: "404",
    message:
      (resp && typeof resp === "object" && "message" in resp && typeof resp.message === "string"
        ? resp.message
        : undefined) || "No data received from OSS Insight API",
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

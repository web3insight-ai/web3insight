import type { DataValue, ResponseResult } from "@/types";
import { isPlainObject } from "@/utils";
import { getVar, getHttpTimeout } from "@/utils/env";
import HttpClient from "@/clients/http/HttpClient";

const token = getVar("STRAPI_API_TOKEN");
const headers: Record<string, string> = {
  "Content-Type": "application/json",
};

if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();

  if (res.ok) {
    return {
      success: true,
      code: `${res.status}`,
      message: "",
      data: jsonData,
      extra: {},
    };
  }

  let message;

  if (res.status === 404) {
    message = `\`${new URL(res.url).pathname}\` is not found`;
  } if (isPlainObject(jsonData) && jsonData.error) {
    message = isPlainObject(jsonData.error) ? jsonData.error.message : jsonData.error;
  }

  return {
    success: false,
    code: `${res.status}`,
    message: message ?? res.statusText ?? "Request failed",
    data: undefined as VT,
    extra: {},
  };
}

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseUrl: `${getVar("STRAPI_API_URL")}/api`,
  headers,
  normalizer: normalizeResponse,
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

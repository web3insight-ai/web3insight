import type { DataValue, ResponseResult } from "@/types";
import { isPlainObject } from "@/utils";
import { getHttpTimeout } from "@/utils/env";
import HttpClient from "@/clients/http/HttpClient";

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();
  const defaultCode = `${res.status}`;

  if (res.ok) {
    if (isPlainObject(jsonData)) {
      const { success, code = defaultCode, message, data, extra, ...others } = jsonData;
      const resBase = { success: success ?? true, code, message };

      return "data" in jsonData ? {
        ...resBase,
        data,
        extra: { ...extra, ...others },
      } : {
        ...resBase,
        data: others,
        extra,
      };
    }

    return {
      success: true,
      code: defaultCode,
      message: "",
      data: jsonData,
      extra: {},
    };
  }

  let message;

  if (res.status === 404) {
    message = `\`${new URL(res.url).pathname}\` is not found`;
  } if (isPlainObject(jsonData)) {
    message = jsonData.message;
  }

  return {
    success: false,
    code: defaultCode,
    message: message ?? res.statusText,
    data: undefined as VT,
    extra: {},
  };
}

// Create base HTTP client
const baseHttpClient = new HttpClient({
  baseUrl: process.env.OPENDIGGER_URL,
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

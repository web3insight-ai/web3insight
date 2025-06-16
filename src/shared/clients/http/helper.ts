import type { DataValue, RequestConfig, ResponseResult } from "../../types";
import { isBoolean, isPlainObject, omit } from "../../utils/index";
import { getVar } from "../../utils/env";

import type { NormalizedPagination, SqlStylePagination } from "./typing";

function isServerSide(inServer?: boolean): boolean {
  if (isBoolean(inServer)) {
    return <boolean>inServer;
  }

  try {
    return !window;
  } catch (error) {
    return true;
  }
}

function removeTailSlashes(str: string) {
  const tailRemoved = str.endsWith("/") ? str.slice(0, -1) : str;

  return tailRemoved.startsWith("/") ? tailRemoved.slice(1) : tailRemoved;
}

function resolveRequestUrl(baseUrl: string | undefined, url: string) {
  if (url.startsWith("http")) {
    return url;
  }

  const globalBaseUrl = removeTailSlashes(getVar("API_BASE_URL"));

  let clientBaseUrl = "";

  if (baseUrl && baseUrl !== "/") {
    clientBaseUrl = baseUrl.startsWith("http") ? baseUrl : `/${removeTailSlashes(baseUrl)}`;
  }

  const prefixedUrl = url.startsWith("/") ? url : `/${url}`;

  return `${globalBaseUrl}${clientBaseUrl}${prefixedUrl}`;
}

async function request(
  url: string,
  method: string,
  data?: Record<string, DataValue> | string,
  config: RequestConfig = {},
) {
  const { baseUrl, headers, ...others } = config;

  let sendBody;

  if (["POST", "PUT"].includes(method)) {
    sendBody = JSON.stringify(data);
  }

  return await fetch(resolveRequestUrl(baseUrl, url), {
    ...omit(others, ["params"]),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    method,
    body: sendBody,
  });
}

function isLogicalSuccess(code: number) {
  return code >= 200 && code < 300;
}

function generateSuccessResponse<VT extends DataValue = DataValue>(
  data: VT,
  message: string = "",
  statusCode: number | string = 200,
): ResponseResult<VT> {
  return {
    success: true,
    code: `${statusCode}`,
    message,
    data,
  };
}

function generateFailedResponse(message: string, statusCode: number | string = 500): ResponseResult<undefined> {
  return {
    success: false,
    code: `${statusCode}`,
    message,
    data: undefined,
  };
}

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();
  const defaultCode = `${res.status}`;

  if (res.ok) {
    if (isPlainObject(jsonData)) {
      const { success, code = defaultCode, message, data, extra, ...others } = jsonData;

      return {
        success: success ?? isLogicalSuccess(Number(code)),
        code,
        message,
        data,
        extra: { ...extra, ...others },
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

async function normalizeRestfulResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  console.log(`[HTTP] ${res.status} ${res.url}`);

  // Get the response text first to check if it's valid JSON
  const responseText = await res.text();

  if (!responseText) {
    console.warn(`[HTTP] Empty response from: ${res.url}`);
    return {
      success: false,
      code: `${res.status}`,
      message: "Empty response received",
      data: undefined as VT,
      extra: {},
    };
  }

  let jsonData;
  try {
    jsonData = JSON.parse(responseText);
  } catch (error) {
    console.error(`[HTTP] JSON parse error for ${res.url}:`, error instanceof Error ? error.message : 'Unknown error');
    console.error(`[HTTP] Response content (first 200 chars):`, responseText.substring(0, 200));

    return {
      success: false,
      code: `${res.status}`,
      message: `Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: undefined as VT,
      extra: { rawResponse: responseText.substring(0, 500) },
    };
  }

  const defaultCode = `${res.status}`;

  if (res.ok) {
    return {
      success: isLogicalSuccess(res.status),
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

const defaultPageSize = 20;

function getDefaultPageSize(): number {
  return defaultPageSize;
}

function resolvePaginationParams(params: NormalizedPagination = {}): SqlStylePagination {
  const { pageSize = getDefaultPageSize(), pageNum = 1 } = params;

  return {
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
  };
}

export {
  isServerSide, request,
  generateSuccessResponse, generateFailedResponse,
  normalizeResponse, normalizeRestfulResponse,
  getDefaultPageSize, resolvePaginationParams,
};

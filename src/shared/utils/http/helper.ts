import type { DataValue, RequestConfig, ResponseResult } from "../../types";
import { isBoolean, isPlainObject, omit } from "../index";
import { getVar } from "../env";

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

  if (method === "POST") {
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

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();

  if (res.ok) {
    if (isPlainObject(jsonData)) {
      const { code, message, data, ...extra } = jsonData;

      return {
        success: isLogicalSuccess(code),
        code,
        message,
        data,
        extra,
      };
    }

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
  } if (isPlainObject(jsonData)) {
    message = jsonData.message;
  }

  return {
    success: false,
    code: `${res.status}`,
    message: message ?? res.statusText,
    data: undefined as VT,
    extra: {},
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

export { isServerSide, request, normalizeResponse, generateFailedResponse };

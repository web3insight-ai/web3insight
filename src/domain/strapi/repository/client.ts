import type { DataValue, ResponseResult } from "@/types";
import { isPlainObject } from "@/utils";
import { getVar } from "@/utils/env";
import HttpClient from "@/clients/http/HttpClient";
import type { HttpClientInitializer } from "@/clients/http/typing";

const token = getVar("STRAPI_API_TOKEN");
const headers: HttpClientInitializer["headers"] = {
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

const httpClient = new HttpClient({
  baseUrl: `${getVar("STRAPI_API_URL")}/api`,
  headers,
  normalizer: normalizeResponse,
});

export default httpClient;

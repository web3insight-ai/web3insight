import type { DataValue, ResponseResult } from "@/types";
import { isPlainObject } from "@/utils";
import { isLogicalSuccess } from "@/clients/http";
import HttpClient from "@/clients/http/HttpClient";

async function normalizeResponse<VT extends DataValue = DataValue>(res: Response): Promise<ResponseResult<VT>> {
  const jsonData = await res.json();
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

const httpClient = new HttpClient({
  baseUrl: process.env.DATA_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.DATA_API_TOKEN}`,
  },
  normalizer: normalizeResponse,
});

export default httpClient;

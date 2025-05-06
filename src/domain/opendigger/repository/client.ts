import type { DataValue, ResponseResult } from "@/types";
import { isPlainObject } from "@/utils";
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

const httpClient = new HttpClient({
  baseUrl: process.env.OPENDIGGER_URL,
  normalizer: normalizeResponse,
});

export default httpClient;

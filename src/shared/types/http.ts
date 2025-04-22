import type { DataValue, ResponseResult as HandieResponseResult } from "@handie/runtime-core";

type RequestConfig = RequestInit & {
  baseUrl?: string;
  params?: Record<string, DataValue>;
  isServer?: boolean;
  noToast?: boolean;
};

type ResponseResult<VT extends DataValue = DataValue> = Omit<HandieResponseResult<VT>, "extra"> & {
  extra?: Record<string, DataValue>;
};

type ResponseInterceptor = (res: ResponseResult, config: RequestConfig) => ResponseResult;

export type { RequestConfig, ResponseResult, ResponseInterceptor };

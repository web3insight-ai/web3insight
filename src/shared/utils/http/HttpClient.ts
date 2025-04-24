import type { DataValue, RequestConfig, ResponseInterceptor } from "../../types";
import { isFunction, isPlainObject } from "../index";
import type { HttpClientInitializer, IHttpClient } from "./typing";
import { isServerSide, request, normalizeResponse } from "./helper";

class HttpClient implements IHttpClient {
  private baseUrl?: HttpClientInitializer["baseUrl"];
  private headers?: HttpClientInitializer["headers"];
  private normalizeResponse: Required<HttpClientInitializer>["normalizer"];

  private resInterceptor?: ResponseInterceptor;

  constructor({ baseUrl, headers, normalizer = normalizeResponse }: HttpClientInitializer) {
    this.baseUrl = baseUrl;
    this.headers = headers;
    this.normalizeResponse = normalizer;
  }

  private setInterceptor(interceptor: ResponseInterceptor) {
    this.resInterceptor = interceptor;
  }

  private async request(
    url: string,
    method: string,
    data?: Record<string, DataValue> | string,
    config: RequestConfig = {},
  ) {
    const { isServer, headers, ...others } = config;
    const res = await request(url, method, data, {
      ...others,
      baseUrl: this.baseUrl,
      isServer: isServerSide(isServer),
      headers: { ...this.headers, ...headers },
    });
    const normalized = await this.normalizeResponse(res);

    return this.resInterceptor ? this.resInterceptor(normalized, config) : normalized;
  }

  public async get(url: string, config: RequestConfig = {}) {
    const { params, ...others } = config;
    const queryString = isPlainObject(params) ? (new URLSearchParams(params)).toString() : "";

    return this.request(queryString ? `${url}?${queryString}` : url, "GET", "", others);
  }

  public async post(url: string, data?: Record<string, DataValue>, config?: RequestConfig) {
    return this.request(url, "POST", data ? data : {}, config);
  }

  public use(interceptor: ResponseInterceptor) {
    if (isFunction(interceptor)) {
      this.setInterceptor(interceptor);
    }
  }
}

export default HttpClient;

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  params?: Record<string, string>;
}

interface RequestConfigWithTimeout extends RequestConfig {
  timeout?: number;
  signal?: AbortSignal;
}

interface ResponseInterceptor {
  (response: unknown): unknown;
}

interface HttpClientInitializer {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  responseInterceptor?: ResponseInterceptor;
  normalizer?: ResponseInterceptor;
}

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private responseInterceptor?: ResponseInterceptor;
  private normalizer?: ResponseInterceptor;

  constructor(config: HttpClientInitializer = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.headers = config.headers || {};
    this.responseInterceptor = config.responseInterceptor;
    this.normalizer = config.normalizer;
  }

  private async request(url: string, config: RequestConfig = {}) {
    let fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // Handle query parameters
    if (config.params && Object.keys(config.params).length > 0) {
      const searchParams = new URLSearchParams(config.params);
      fullURL += (fullURL.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout);

    // Use provided signal if available, otherwise use our timeout controller
    const signal = config.signal || controller.signal;

    try {
      const response = await fetch(fullURL, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = response;
      }

      // Apply normalizer first (for data transformation)
      if (this.normalizer) {
        data = this.normalizer(data);
      }

      // Apply response interceptor (for side effects/logging)
      if (this.responseInterceptor) {
        data = this.responseInterceptor(data);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(url, { ...config, method: 'GET' });
  }

  post(url: string, data?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request(url, { ...config, method: 'POST', body: data });
  }

  put(url: string, data?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request(url, { ...config, method: 'PUT', body: data });
  }

  delete(url: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request(url, { ...config, method: 'DELETE' });
  }

  patch(url: string, data?: unknown, config?: Omit<RequestConfig, 'method'>) {
    return this.request(url, { ...config, method: 'PATCH', body: data });
  }

  use(interceptor: ResponseInterceptor) {
    this.responseInterceptor = interceptor;
    return this;
  }
}

export default HttpClient;
export type { RequestConfig, RequestConfigWithTimeout, ResponseInterceptor, HttpClientInitializer };

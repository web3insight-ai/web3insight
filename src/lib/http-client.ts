import { ResponseResult } from "@/types/api"

class HttpClient {
  private baseURL: string

  constructor(baseURL: string = "") {
    this.baseURL = baseURL
  }

  private async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<ResponseResult<T>> {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url

    try {
      const response = await fetch(fullURL, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          code: response.status.toString(),
          message: data.message || response.statusText,
          data: data,
        }
      }

      // 如果 API 响应已经是 ResponseResult 格式（包含 success 字段），直接返回
      if (data && typeof data === 'object' && 'success' in data) {
        return data as ResponseResult<T>
      }

      // 否则包装成 ResponseResult 格式
      return {
        success: true,
        code: "200",
        message: "",
        data: data,
      }
    } catch (error) {
      return {
        success: false,
        code: "500",
        message: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  async get<T = any>(url: string, options: RequestInit = {}): Promise<ResponseResult<T>> {
    return this.request<T>(url, { ...options, method: "GET" })
  }

  async post<T = any>(
    url: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T = any>(
    url: string,
    body?: any,
    options: RequestInit = {}
  ): Promise<ResponseResult<T>> {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T = any>(url: string, options: RequestInit = {}): Promise<ResponseResult<T>> {
    return this.request<T>(url, { ...options, method: "DELETE" })
  }
}

export const httpClient = new HttpClient()

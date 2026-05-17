// ResponseResult type to match existing API patterns
export interface ResponseResult<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  code: string;
  extra?: unknown;
}

// Common data value types for API payloads
export type DataValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

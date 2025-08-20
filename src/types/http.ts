// ResponseResult type to match existing API patterns
export interface ResponseResult<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  code: string;
  extra?: unknown;
}

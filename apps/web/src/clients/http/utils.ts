import type { ResponseResult } from '../../types/http';

// Utility functions to match the @handie/http interface
export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

export function generateSuccessResponse<T>(data: T, message = 'Success'): ResponseResult<T> {
  return {
    success: true,
    data,
    message,
    code: '200',
  };
}

export function generateFailedResponse<T = undefined>(
  message = 'Failed',
  code = '400',
  data?: T,
): ResponseResult<T> {
  return {
    success: false,
    data: data as T,
    message,
    code,
  };
}

export function normalizeRestfulResponse<T>(response: unknown): ResponseResult<T> {
  // If it's already in the correct format
  if (typeof response === 'object' && response !== null && 'success' in response) {
    return response as ResponseResult<T>;
  }

  // Normalize from different API response formats
  if (response && typeof response === 'object' && ('status' in response || 'ok' in response)) {
    const responseObj = response as Record<string, unknown>;
    if (responseObj.status === 'success' || responseObj.ok) {
      return generateSuccessResponse((responseObj.data ?? response) as T);
    }

    if (responseObj.status === 'error' || responseObj.error) {
      const message = typeof responseObj.message === 'string' ? responseObj.message : 'Request failed';
      const code = typeof responseObj.code === 'string' ? responseObj.code : '400';
      return generateFailedResponse(message, code);
    }
  }

  // Default to success if we can't determine
  return generateSuccessResponse(response as T);
}

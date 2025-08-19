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
  if (typeof response === 'object' && 'success' in response) {
    return response;
  }

  // Normalize from different API response formats
  if (response?.status === 'success' || response?.ok) {
    return generateSuccessResponse(response.data || response);
  }

  if (response?.status === 'error' || response?.error) {
    return generateFailedResponse(response.message || 'Request failed', response.code || '400');
  }

  // Default to success if we can't determine
  return generateSuccessResponse(response);
}

import type { NormalizedPagination, SqlStylePagination } from "./typing";

const defaultPageSize = 20;

function getDefaultPageSize(): number {
  return defaultPageSize;
}

function resolvePaginationParams(params: NormalizedPagination = {}): SqlStylePagination {
  const { pageSize = getDefaultPageSize(), pageNum = 1 } = params;

  return {
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
  };
}

export { getDefaultPageSize, resolvePaginationParams };

type NormalizedPagination = {
  pageNum?: number;
  pageSize?: number;
};

type SqlStylePagination = {
  take: number;
  skip: number;
};

export type { NormalizedPagination, SqlStylePagination };

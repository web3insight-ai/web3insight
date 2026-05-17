import type { ReactNode, Key } from "react";

import type { DataValue } from "@/types";

// Local column type
interface ColumnProps {
  name: string;
  label?: string;
  width?: string | number;
  align?: "left" | "center" | "right";
}

type TableColumn<T = Record<string, DataValue>> = Omit<
  ColumnProps,
  "render"
> & {
  span?: number;
  key?: Key;
  title?: ReactNode;
  render?: (
    value: DataValue,
    context: {
      row: T;
      column: TableColumn<T>;
      index: number;
    },
  ) => ReactNode;
};

interface DataTableProps<T = Record<string, DataValue>> {
  className?: string;
  dataSource: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  hidePagination?: boolean;
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onCurrentChange?: (page: number) => void;
}

interface PaginationProps {
  className?: string;
  disabled?: boolean;
  total?: number;
  pageSize?: number;
  currentPage?: number;
  onCurrentChange?: (page: number) => void;
}

export type { TableColumn, DataTableProps, PaginationProps };

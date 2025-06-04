import type { ReactNode } from "react";
import type { ColumnProps, IDataTableComponent } from "petals-ui/dist/data-table";

import type { DataValue } from "../../../types";

type TableColumn<T extends DataValue = Record<string, DataValue>> = Omit<ColumnProps, "render"> & {
  span?: number;
  render?: (
    I_DO_NOT_KNOW_WHAT_THIS_FOR: DataValue,
    context: {
      row: T;
      column: TableColumn<T>;
      index: number;
    },
  ) => ReactNode;
};

type DataTableProps<T extends DataValue = Record<string, DataValue>> = Partial<Omit<IDataTableComponent, "dataSource" | "columns">> & {
  className?: string;
  dataSource: T[];
  columns: TableColumn<T>[];
};

type PaginationProps = Pick<DataTableProps, "className" | "total" | "pageSize" | "currentPage" | "onCurrentChange"> & {
  disabled?: boolean;
};

export type { TableColumn, DataTableProps, PaginationProps };

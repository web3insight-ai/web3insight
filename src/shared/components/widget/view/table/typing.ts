import type { ReactNode } from "react";

import type { DataValue, ClientAction, ViewDescriptor } from "../../../../types";
import type { DataTableProps } from "../../../control/data-table";

type TableViewWidgetProps<T extends DataValue = Record<string, DataValue>> = Pick<
  ViewDescriptor, "fields"
> & Pick<
  DataTableProps<T>, "className" | "dataSource" | "loading" | "total" | "pageSize" | "currentPage" | "onCurrentChange"
> & {
  search?: ReactNode;
  actions?: (Omit<ClientAction, "category" | "execute"> & {
    execute?: (data: T) => void;
  })[]
};

export type { TableViewWidgetProps };

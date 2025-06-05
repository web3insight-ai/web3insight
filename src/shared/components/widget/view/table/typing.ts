import type { ReactNode } from "react";

import type { DataValue, ViewDescriptor } from "../../../../types";
import type { DataTableProps } from "../../../control/data-table";

type TableViewWidgetProps<T extends DataValue = Record<string, DataValue>> = Pick<
  ViewDescriptor, "fields" | "actions"
> & Pick<
  DataTableProps<T>, "className" | "dataSource" | "loading" | "total" | "pageSize" | "currentPage" | "onCurrentChange"
> & {
  search?: ReactNode;
};

export type { TableViewWidgetProps };

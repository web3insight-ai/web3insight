import type { ReactNode, PropsWithChildren } from "react";

import type { DataValue, ClientAction, ViewDescriptor } from "../../../../types";
import type { DataTableProps } from "../../../control/data-table";

type TableViewAction<T extends DataValue = Record<string, DataValue>> = Omit<ClientAction, "category" | "execute"> & {
  execute?: (data: T) => void;
};

type ActionGroup<T extends DataValue = Record<string, DataValue>> = Record<"inline" | "others", TableViewAction<T>[]>;

type ActionBarProps = {
  className?: string;
  actions: TableViewAction[];
};

type SearchProps = PropsWithChildren<{
  className?: string;
}>;

type TableViewWidgetProps<T extends DataValue = Record<string, DataValue>> = Pick<
  ViewDescriptor, "fields"
> & Pick<
  DataTableProps<T>, "className" | "dataSource" | "loading" | "hidePagination" | "total" | "pageSize" | "currentPage" | "onCurrentChange"
> & {
  search?: ReactNode;
  actions?: TableViewAction<T>[];
};

export type { TableViewAction, ActionGroup, ActionBarProps, SearchProps, TableViewWidgetProps };

import clsx from "clsx";

import DataTable from "../../../control/data-table";

import type { TableViewWidgetProps } from "./typing";
import { resolveColumns } from "./helper";
import Search from "./Search";

function TableView({
  className,
  fields,
  actions,
  search,
  ...rest
}: TableViewWidgetProps) {
  return (
    <div className={clsx("max-h-full flex flex-col", className)}>
      {search && (
        <Search className="flex-shrink-0 border-b">
          {search}
        </Search>
      )}
      <DataTable
        className="flex-grow min-h-0"
        columns={resolveColumns({ fields, actions })}
        {...rest}
      />
    </div>
  );
}

export default TableView;

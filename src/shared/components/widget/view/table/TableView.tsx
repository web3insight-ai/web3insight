import clsx from "clsx";

import DataTable from "../../../control/data-table";

import type { TableViewWidgetProps } from "./typing";
import { resolveActionGroup, resolveColumns } from "./helper";
import Search from "./Search";
import ActionBar from "./ActionBar";

function TableView({
  className,
  fields,
  actions,
  search,
  ...rest
}: TableViewWidgetProps) {
  const { inline, others } = resolveActionGroup(actions);
  const actionBarAvailable = others.length > 0;

  return (
    <div className={clsx("max-h-full flex flex-col", className)}>
      {(search || actionBarAvailable) && (
        <div className="flex-shrink-0">
          {search && (
            <Search className="border-b">{search}</Search>
          )}
          {actionBarAvailable && (
            <ActionBar actions={others} />
          )}
        </div>
      )}
      <DataTable
        className="flex-grow min-h-0"
        columns={resolveColumns({ fields, actions: inline })}
        {...rest}
      />
    </div>
  );
}

export default TableView;

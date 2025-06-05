import clsx from "clsx";

import DataTable from "../../../control/data-table";

import type { TableViewWidgetProps } from "./typing";
import { resolveColumns } from "./helper";
import Search from "./Search";

function TableView({
  className,
  dataSource,
  fields,
  search,
  loading,
  total,
  pageSize,
  currentPage,
  onCurrentChange,
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
        dataSource={dataSource}
        columns={resolveColumns(fields)}
        loading={loading}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
        onCurrentChange={onCurrentChange}
      />
    </div>
  );
}

export default TableView;

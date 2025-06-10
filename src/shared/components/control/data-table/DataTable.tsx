import clsx from "clsx";

import type { DataTableProps } from "./typing";

import Table from "./Table";
import Pagination from "./Pagination";

function DataTable({
  className,
  dataSource,
  columns,
  loading,
  hidePagination = false,
  total,
  currentPage,
  pageSize,
  onCurrentChange,
}: DataTableProps) {
  return (
    <div className={clsx("max-h-full flex flex-col", className)}>
      <Table
        className="flex-grow min-h-0 overflow-auto"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
      />
      {!hidePagination && (
        <Pagination
          className="flex-shrink-0 border-t"
          disabled={loading}
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
          onCurrentChange={onCurrentChange}
        />
      )}
    </div>
  );
}

export default DataTable;

import clsx from "clsx";

import type { DataTableProps } from "./typing";

import Search from "./Search";
import Table from "./Table";
import Pagination from "./Pagination";

function DataTable({
  className,
  dataSource,
  columns,
  loading,
  total,
  currentPage,
  pageSize,
  onCurrentChange,
}: DataTableProps) {
  return (
    <div className={clsx("max-h-full flex flex-col", className)}>
      <Search className="flex-shrink-0 border-b" />
      <Table
        className="flex-grow min-h-0 overflow-auto"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
      />
      <Pagination
        className="flex-shrink-0 border-t"
        disabled={loading}
        total={total}
        currentPage={currentPage}
        pageSize={pageSize}
        onCurrentChange={onCurrentChange}
      />
    </div>
  );
}

export default DataTable;

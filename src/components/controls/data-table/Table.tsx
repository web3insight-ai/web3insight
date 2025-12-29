import clsx from "clsx";
import { Spinner } from "@nextui-org/react";

import type { DataValue } from "@/types";
import type { DataTableProps, TableColumn } from "./typing";
import { resolveColumns, resolveColumnClassName } from "./helper";

function Table({
  className,
  dataSource,
  columns: rawCols,
  loading,
}: Pick<
  DataTableProps<Record<string, DataValue>>,
  "className" | "dataSource" | "columns" | "loading"
>) {
  const { showSerialNumber, columns } = resolveColumns(rawCols);

  return (
    <div className={clsx("relative flex flex-col", className)}>
      <div className="flex-shrink-0 px-8 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        {showSerialNumber && (
          <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            #
          </div>
        )}
        {columns.map((col) => (
          <div
            key={String(col.key ?? col.name)}
            className={resolveColumnClassName(
              col,
              "text-xs font-medium text-gray-500 dark:text-gray-400",
            )}
          >
            {col.title}
          </div>
        ))}
      </div>
      <div className="flex-grow min-h-0 overflow-auto">
        {dataSource.length > 0 ? (
          <>
            {dataSource.map((item, index) => (
              <div
                key={index}
                className="px-8 py-4 grid grid-cols-12 gap-2 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
              >
                {showSerialNumber && (
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium`}
                    >
                      {index + 1}
                    </span>
                  </div>
                )}
                {columns.map((col) => {
                  const colKey = String(col.key ?? col.name);
                  const cellValue = item[colKey];
                  // Only render primitive values directly, not objects/arrays
                  const displayValue =
                    typeof cellValue === "string" ||
                    typeof cellValue === "number" ||
                    typeof cellValue === "boolean"
                      ? String(cellValue)
                      : null;
                  return (
                    <div
                      key={`${colKey}-${index}`}
                      className={resolveColumnClassName(
                        col,
                        "font-medium text-gray-700 dark:text-gray-300",
                      )}
                    >
                      {col.render
                        ? col.render(cellValue, {
                          row: item,
                          column: col as TableColumn<
                              Record<string, DataValue>
                            >,
                          index,
                        })
                        : displayValue}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            No data
          </div>
        )}
      </div>
      {loading && (
        <div className="absolute top-0 left-0 z-10 w-full h-full flex items-center justify-center bg-white/90">
          <Spinner label="Loading" />
        </div>
      )}
    </div>
  );
}

export default Table;

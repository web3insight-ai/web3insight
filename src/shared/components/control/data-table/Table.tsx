import clsx from "clsx";

import type { DataTableProps } from "./typing";
import { resolveColumns, resolveColumnClassName } from "./helper";

function Table({ className, dataSource, columns: rawCols }: Pick<DataTableProps, "className" | "dataSource" | "columns">) {
  const { showSerialNumber, columns } = resolveColumns(rawCols);

  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex-shrink-0 px-8 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        {showSerialNumber && (
          <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">#</div>
        )}
        {columns.map(col => (
          <div
            key={col.key}
            className={resolveColumnClassName(col, "text-xs font-medium text-gray-500 dark:text-gray-400")}
          >
            {col.title}
          </div>
        ))}
      </div>
      <div className="flex-grow min-h-0 overflow-auto">
        {dataSource.map((item, index) => (
          <div
            key={index}
            className="px-8 py-4 grid grid-cols-12 gap-2 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
          >
            {showSerialNumber && (
              <div className="col-span-1">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                  ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  text-xs font-medium`}>{index + 1}</span>
              </div>
            )}
            {columns.map(col => (
              <div
                key={`${col.key}-${index}`}
                className={resolveColumnClassName(col, "font-medium text-gray-700 dark:text-gray-300")}
              >
                {col.render? col.render(undefined, { row: item, column: col, index }) : item[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Table;

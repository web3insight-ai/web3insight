import clsx from "clsx";
import { Pagination as NextUiPagination } from "@nextui-org/react";

import type { PaginationProps } from "./typing";
import { resolveItemCountRange } from "./helper";

function Pagination({
  className,
  total = 0,
  pageSize = 20,
  currentPage = 1,
  disabled,
  onCurrentChange,
}: PaginationProps) {
  const [startCount, endCount] = resolveItemCountRange(currentPage, total, pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={clsx("flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-surface dark:bg-surface-dark border-t border-border dark:border-border-dark", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Showing</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 px-2 py-1 bg-white dark:bg-black/20 rounded-md border border-border dark:border-border-dark">
            {startCount}-{endCount}
          </span>
          <span className="text-gray-500 dark:text-gray-400">of</span>
          <span className="font-medium text-gray-900 dark:text-gray-100 px-2 py-1 bg-white dark:bg-black/20 rounded-md border border-border dark:border-border-dark">
            {total}
          </span>
          <span className="text-gray-500 dark:text-gray-400">results</span>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
            Page {currentPage} of {totalPages}
          </span>
          <NextUiPagination
            page={currentPage}
            total={totalPages}
            isDisabled={disabled}
            onChange={onCurrentChange}
            size="sm"
            variant="light"
            showControls
            classNames={{
              wrapper: "gap-1",
              item: "bg-white dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-white/10 transition-colors",
              cursor: "bg-primary text-white shadow-card",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Pagination;

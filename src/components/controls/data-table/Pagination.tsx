import clsx from "clsx";
import { Pagination as NextUiPagination } from "@/components/ui";

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
  const [startCount, endCount] = resolveItemCountRange(
    currentPage,
    total,
    pageSize,
  );
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bg-sunken border-t border-rule",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-fg-muted">Showing</span>
          <span className="font-medium text-fg px-2 py-1 bg-bg-raised rounded-[2px] border border-rule">
            {startCount}-{endCount}
          </span>
          <span className="text-fg-muted">of</span>
          <span className="font-medium text-fg px-2 py-1 bg-bg-raised rounded-[2px] border border-rule">
            {total}
          </span>
          <span className="text-fg-muted">results</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-fg-muted hidden sm:block">
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
              item: "bg-bg-raised border border-rule hover:bg-bg-sunken dark:hover:bg-white/10 transition-colors",
              cursor: "bg-accent text-accent-fg",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Pagination;

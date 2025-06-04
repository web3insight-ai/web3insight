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

  return (
    <div className={clsx("flex items-center justify-between px-8 py-4", className)}>
      <div>Number: {startCount}-{endCount} / Total: {total}</div>
      <NextUiPagination
        page={currentPage}
        total={Math.ceil(total / pageSize)}
        isDisabled={disabled}
        onChange={onCurrentChange}
      />
    </div>
  );
}

export default Pagination;

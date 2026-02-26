"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
  siblings?: number;
  className?: string;
}

function getRange(start: number, end: number) {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

function getPaginationRange(current: number, total: number, siblings: number) {
  const totalNumbers = siblings * 2 + 5;

  if (totalNumbers >= total) return getRange(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = siblings * 2 + 3;
    return [...getRange(1, leftCount), -1, total];
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = siblings * 2 + 3;
    return [1, -1, ...getRange(total - rightCount + 1, total)];
  }

  return [1, -1, ...getRange(leftSibling, rightSibling), -2, total];
}

function Pagination({
  page,
  total,
  onChange,
  siblings = 1,
  className,
}: PaginationProps) {
  if (total <= 1) return null;

  const range = getPaginationRange(page, total, siblings);

  return (
    <nav
      className={clsx("flex items-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {range.map((item, idx) => {
        if (item < 0) {
          return (
            <span
              key={`dots-${idx}`}
              className="px-1 text-gray-400 select-none"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={clsx(
              "min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors",
              item === page
                ? "bg-primary text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
            )}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export { Pagination };
export type { PaginationProps };

import clsx from "clsx";

import type { TableColumn } from "./typing";

function resolveColumns(cols: TableColumn[]): { showSerialNumber: boolean; columns: TableColumn[] } {
  const columns: TableColumn[] = [];

  let showSerialNumber = false;

  cols.forEach(col => {
    if (col.type === "index") {
      showSerialNumber = true;
    } else {
      columns.push(col);
    }
  });

  return { showSerialNumber, columns };
}

const spanClassNameMap: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

function resolveColumnClassName(col: TableColumn, baseClassName: string = ""): string {
  const spanClassName = spanClassNameMap[col.span || 1] || spanClassNameMap[1];

  return clsx(baseClassName, spanClassName, {
    "text-center": col.align === "center",
    "text-right": col.align === "right",
  });
}

export { resolveColumns, resolveColumnClassName };

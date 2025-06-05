import clsx from "clsx";

import type { DataTableProps } from "./typing";

function Search({ className }: Pick<DataTableProps, "className">) {
  return (
    <div className={clsx("px-8 py-4", className)}>Search area</div>
  );
}

export default Search;

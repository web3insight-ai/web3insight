import clsx from "clsx";

import type { SearchProps } from "./typing";

function Search({ className, children }: SearchProps) {
  return (
    <div className={clsx("px-8 py-4", className)}>
      {children}
    </div>
  );
}

export default Search;

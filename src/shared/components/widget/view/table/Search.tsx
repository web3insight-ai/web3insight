import type { PropsWithChildren } from "react";
import clsx from "clsx";

function Search({ className, children }: PropsWithChildren<{ className?: string; }>) {
  return (
    <div className={clsx("px-8 py-4", className)}>
      {children}
    </div>
  );
}

export default Search;

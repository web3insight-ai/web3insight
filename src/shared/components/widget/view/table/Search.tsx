import clsx from "clsx";

function Search({ className }: { className?: string; }) {
  return (
    <div className={clsx("px-8 py-4", className)}>Search area</div>
  );
}

export default Search;

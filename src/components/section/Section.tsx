import clsx from "clsx";

import type { SectionProps } from "./typing";

function Section({
  className,
  children,
  title,
  summary,
  contentHeightFixed,
}: SectionProps) {
  const classNameMap = contentHeightFixed
    ? {
      container: "flex flex-col",
      header: "flex-shrink-0",
      content: "flex-grow min-h-0 overflow-auto",
    }
    : {};

  return (
    <div className={clsx(classNameMap.container, className)}>
      <div className={clsx(classNameMap.header, "relative pb-8")}>
        <div className="flex items-center gap-4 max-w-3xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent flex-1" />
          <div className="text-center shrink-0">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {title}
            </h2>
            {summary && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {summary}
              </p>
            )}
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent flex-1" />
        </div>
      </div>
      <div className={classNameMap.content}>{children}</div>
    </div>
  );
}

export default Section;

import clsx from "clsx";

import type { SectionProps } from "./typing";

function Section({ className, children, title, summary, contentHeightFixed }: SectionProps) {
  const classNameMap = contentHeightFixed ? {
    container: "flex flex-col",
    header: "flex-shrink-0",
    content: "flex-grow min-h-0 overflow-auto",
  } : {};

  return (
    <div className={clsx(classNameMap.container, className)}>
      <div className={clsx(classNameMap.header, "relative pb-8")}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {/* Left decorative element */}
          <div className="flex items-center flex-1">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-800 flex-1" />
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-800 rounded-full mx-3" />
          </div>
          
          {/* Center content */}
          <div className="text-center px-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {summary}
            </p>
          </div>
          
          {/* Right decorative element */}
          <div className="flex items-center flex-1">
            <div className="w-2 h-2 bg-gray-200 dark:bg-gray-800 rounded-full mx-3" />
            <div className="h-[1px] bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-800 flex-1" />
          </div>
        </div>
      </div>
      <div className={classNameMap.content}>
        {children}
      </div>
    </div>
  );
}

export default Section;

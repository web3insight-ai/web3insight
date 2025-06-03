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
      <div className={clsx(classNameMap.header, "flex flex-col space-y-1 pb-6")}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400">{summary}</p>
      </div>
      <div className={classNameMap.content}>
        {children}
      </div>
    </div>
  );
}

export default Section;

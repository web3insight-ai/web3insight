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
    <section className={clsx(classNameMap.container, className)}>
      <header
        className={clsx(
          classNameMap.header,
          "flex items-start justify-between gap-6 border-b border-rule pb-4 mb-6",
        )}
      >
        <div className="flex flex-col gap-1.5 max-w-[var(--measure)]">
          <h2 className="font-display text-[1.5rem] leading-[1.15] font-semibold tracking-[-0.01em] text-fg">
            {title}
          </h2>
          {summary && (
            <p className="text-[0.9375rem] leading-[1.5] text-fg-muted">
              {summary}
            </p>
          )}
        </div>
      </header>
      <div className={classNameMap.content}>{children}</div>
    </section>
  );
}

export default Section;

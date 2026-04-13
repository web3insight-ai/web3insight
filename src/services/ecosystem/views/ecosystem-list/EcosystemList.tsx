import Link from "next/link";

import { EmptyState } from "$/primitives";

import type { EcosystemListViewWidgetProps } from "./typing";

function EcosystemListView({ dataSource }: EcosystemListViewWidgetProps) {
  if (dataSource.length === 0) {
    return (
      <EmptyState
        label="no ecosystems"
        title="Nothing indexed under this filter."
        hint="Try widening the filter, or re-sync from the admin console."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
      {dataSource.map((eco) => (
        <li key={(eco.name || "unknown").replaceAll(" ", "")}>
          <Link
            href={`/admin/ecosystems/${encodeURIComponent(eco.name || "unknown-ecosystem")}`}
            className="group block"
          >
            <div className="flex min-h-32 items-center justify-center rounded-[2px] border border-rule bg-bg-raised px-4 py-6 transition-colors hover:bg-bg-sunken hover:border-rule-strong">
              <span className="text-center text-sm font-medium text-fg transition-colors group-hover:text-accent">
                {eco.name || "Unknown Ecosystem"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default EcosystemListView;

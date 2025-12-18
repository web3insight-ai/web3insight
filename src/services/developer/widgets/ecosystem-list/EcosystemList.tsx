import clsx from "clsx";
import Link from "next/link";
import { Layers } from "lucide-react";

import type { EcosystemInfo } from "../../typing";

interface EcosystemListProps {
  className?: string;
  ecosystems: EcosystemInfo[];
}

function EcosystemList({ className, ecosystems }: EcosystemListProps) {
  if (!ecosystems || ecosystems.length === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        "border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Ecosystems Contributed
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({ecosystems.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ecosystems.map((eco) => (
          <Link
            key={eco.ecosystem}
            href={`/ecosystems/${encodeURIComponent(eco.ecosystem)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200"
          >
            {eco.ecosystem}
            {eco.repoCount !== undefined && eco.repoCount > 0 && (
              <span className="text-xs text-primary/70">
                ({eco.repoCount} repos)
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default EcosystemList;

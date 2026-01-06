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
        "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} className="text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Ecosystems Contributed
        </h3>
        <span className="text-xs text-gray-400">({ecosystems.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ecosystems.map((eco) => (
          <Link
            key={eco.ecosystem}
            href={`/ecosystems/${encodeURIComponent(eco.ecosystem)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            {eco.ecosystem}
            {eco.repoCount !== undefined && eco.repoCount > 0 && (
              <span className="text-gray-400 dark:text-gray-500">
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

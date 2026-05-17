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
        "rounded-[2px] border border-rule bg-bg-raised p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} className="text-fg-subtle" />
        <h3 className="text-sm font-medium text-fg">Ecosystems Contributed</h3>
        <span className="text-xs text-fg-subtle">({ecosystems.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ecosystems.map((eco) => (
          <Link
            key={eco.ecosystem}
            href={`/ecosystems/${encodeURIComponent(eco.ecosystem)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-bg-raised text-fg-muted hover:bg-bg-sunken transition-colors border border-rule"
          >
            {eco.ecosystem}
            {eco.repoCount !== undefined && eco.repoCount > 0 && (
              <span className="text-fg-subtle">({eco.repoCount} repos)</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default EcosystemList;

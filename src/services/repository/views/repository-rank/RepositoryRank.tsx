"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TableHeader from "$/controls/table-header";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

import { resolveDataSource } from "../../helper";

import type { RepositoryRankViewWidgetProps } from "./typing";

function RepositoryRankView({
  className,
  dataSource,
}: RepositoryRankViewWidgetProps) {
  const resolvedData = resolveDataSource(dataSource);
  const displayedData = resolvedData.slice(0, 10);

  return (
    <Panel
      label={{ text: "ranking · repos", position: "tl" }}
      className={`overflow-hidden ${className || ""}`}
    >
      <div className="px-5 pt-5 pb-3 border-b border-rule">
        <SmallCapsLabel>top repositories</SmallCapsLabel>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-rule bg-bg-sunken">
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                #
              </th>
              <TableHeader>Repository</TableHeader>
              <TableHeader
                align="right"
                tooltip="Total number of stars received by this repository"
              >
                Stars
              </TableHeader>
              <TableHeader
                align="right"
                tooltip="Total number of forks created from this repository"
              >
                Forks
              </TableHeader>
              <TableHeader
                align="right"
                tooltip="Current number of open issues in this repository"
              >
                Issues
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {displayedData.map((repo, index) => (
              <tr
                key={index}
                className="hover:bg-bg-sunken transition-colors duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-[11px] text-fg-muted tabular-nums">
                    {String(index + 1).padStart(3, "0")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/repositories/${repo.id || "unknown"}?name=${encodeURIComponent(repo.fullName || "unknown-repo")}`}
                    className="font-medium text-fg hover:text-accent transition-colors duration-200"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {repo.fullName || "Unknown Repository"}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-fg font-mono text-sm tabular-nums">
                    {repo.statistics.star.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-fg font-mono text-sm tabular-nums">
                    {repo.statistics.fork.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-fg font-mono text-sm tabular-nums">
                    {repo.statistics.openIssue.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-rule">
        <Link
          href="/repositories"
          className="flex items-center justify-center gap-2 text-sm font-medium text-fg-muted hover:text-accent transition-colors duration-200"
        >
          View All Repositories
          <ArrowRight size={16} />
        </Link>
      </div>
    </Panel>
  );
}

export default RepositoryRankView;

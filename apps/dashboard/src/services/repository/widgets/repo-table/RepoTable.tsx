import clsx from "clsx";
import { Panel } from "$/blueprint";
import { SmallCapsLabel } from "$/primitives";

import RepoLinkWidget from "../repo-link";

import type { RepoTableProps } from "./typing";

function RepoTable({ className, dataSource, title, icon }: RepoTableProps) {
  return (
    <Panel
      label={
        typeof title === "string"
          ? { text: title.toLowerCase(), position: "tl" }
          : undefined
      }
      className={clsx("overflow-hidden", className)}
    >
      {(title || icon) && (
        <div className="px-5 pt-5 pb-3 border-b border-rule flex items-center gap-2">
          {icon}
          <SmallCapsLabel>{title}</SmallCapsLabel>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-rule bg-bg-sunken">
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em] w-12">
                #
              </th>
              <th className="px-6 py-3 text-left font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Repository
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Stars
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Forks
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Issues
              </th>
              <th className="px-6 py-3 text-right font-mono text-[10px] font-medium text-fg-muted uppercase tracking-[0.18em]">
                Contributors
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {dataSource.map((repo, index) => (
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
                  <RepoLinkWidget
                    className="font-medium text-fg hover:text-accent transition-colors"
                    repo={repo.fullName}
                    repoId={repo.id}
                  />
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
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {repo.statistics.contributor > 0 ? (
                    <span className="text-fg font-mono text-sm tabular-nums">
                      {repo.statistics.contributor.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-fg-subtle">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default RepoTable;

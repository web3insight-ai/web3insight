"use client";

import { Card, CardHeader } from "@/components/ui";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import TableHeader from "$/controls/table-header";

import RepoLinkWidget from "../../../repository/widgets/repo-link";

import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperLink from "./DeveloperLink";

function DeveloperRankTableView({
  dataSource,
}: Pick<DeveloperRankViewWidgetProps, "dataSource">) {
  const displayedData = dataSource.slice(0, 10);

  return (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
      <CardHeader className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Users size={18} className="text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Top Contributors
          </h3>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">
                #
              </th>
              <TableHeader>Developer</TableHeader>
              <TableHeader tooltip="Weighted contribution score based on PRs and recent activity. Recent contributions are weighted higher than older ones.">
                Contribution Score
              </TableHeader>
              <TableHeader tooltip="Most active repositories this developer contributes to">
                Top Projects
              </TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {displayedData.map((developer, index) => (
              <tr
                key={developer.actor_id}
                className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110 bg-gray-50 dark:bg-surface-dark text-gray-500 dark:text-gray-500`}
                    >
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <DeveloperLink
                    className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                    developer={developer}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {developer.total_commit_count.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {developer.top_repos.slice(0, 2).map((project) => (
                      <RepoLinkWidget
                        key={`${developer.actor_id}-${project.repo_id}`}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                        repo={project.repo_name}
                        repoId={project.repo_id}
                      />
                    ))}
                    {developer.top_repos.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{developer.top_repos.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-border dark:border-border-dark">
        <Link
          href="/developers"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200"
        >
          View All Developers
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}

export default DeveloperRankTableView;

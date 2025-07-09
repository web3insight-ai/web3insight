import clsx from "clsx";
import { Card, CardHeader } from "@nextui-org/react";

import RepoLinkWidget from "../repo-link";

import type { RepoTableProps } from "./typing";

function RepoTable({ className, dataSource, title, icon }: RepoTableProps ) {
  return (
    <Card className={clsx("bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden", className)}>
      {(title || icon) && (
        <>
          <CardHeader className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            </div>
          </CardHeader>
        </>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Repository</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Stars</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Forks</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Issues</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Contributors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {dataSource.map((repo, index) => (
              <tr 
                key={index} 
                className="hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200 group-hover:scale-110
                      ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                index === 1 ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400' :
                  index === 2 ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' :
                    'bg-gray-50 dark:bg-gray-900/10 text-gray-500 dark:text-gray-500'}`}>
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RepoLinkWidget
                    className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                    repo={repo.fullName}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {repo.statistics.star.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {repo.statistics.fork.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {repo.statistics.openIssue.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {repo.statistics.contributor.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default RepoTable;

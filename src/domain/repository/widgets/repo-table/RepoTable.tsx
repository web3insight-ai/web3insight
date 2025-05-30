import clsx from "clsx";
import { Card, CardHeader, Divider } from "@nextui-org/react";

import RepoLinkWidget from "../repo-link";

import type { RepoTableProps } from "./typing";

function RepoTable({ className, dataSource, title, icon }: RepoTableProps ) {
  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none hover:shadow-md transition-all duration-300", className)}>
      {(title || icon) && (
        <>
          <CardHeader className="px-8 py-5">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
          </CardHeader>
          <Divider />
        </>
      )}
      <div className="px-8 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">#</div>
        <div className="col-span-5 text-xs font-medium text-gray-500 dark:text-gray-400">Repository</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Stars</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Forks</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Issues (open)</div>
      </div>
      <div>
        {dataSource.map((repo, index) => (
          <div
            key={index}
            className="px-8 py-4 grid grid-cols-12 gap-2 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
          >
            {/* Rank number */}
            <div className="col-span-1">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
            index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
              'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                text-xs font-medium`}>{index + 1}</span>
            </div>

            {/* Repository name */}
            <div className="col-span-5 flex items-center">
              <RepoLinkWidget
                className="font-medium text-gray-900 dark:text-white"
                repo={repo.fullName}
              />
            </div>
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              {repo.statistics.star.toLocaleString()}
            </div>
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              {repo.statistics.fork.toLocaleString()}
            </div>
            <div className="col-span-2 text-right font-medium text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-end gap-1">
                <span>{repo.statistics.openIssue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default RepoTable;

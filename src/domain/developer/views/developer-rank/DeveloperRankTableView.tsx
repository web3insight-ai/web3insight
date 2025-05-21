import { Card, CardHeader, Divider } from "@nextui-org/react";
import { Users } from "lucide-react";

import RepoLinkWidget from "../../../repository/widgets/repo-link";

import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperLink from "./DeveloperLink";

function DeveloperRankTableView({ dataSource }: Pick<DeveloperRankViewWidgetProps, "dataSource">) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-secondary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Contributors</h3>
        </div>
      </CardHeader>
      <Divider />
      <div className="px-8 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-800 grid grid-cols-12 gap-2">
        <div className="col-span-1 text-xs font-medium text-gray-500 dark:text-gray-400">#</div>
        <div className="col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400">Developer</div>
        <div className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">Score</div>
        <div className="col-span-6 text-xs font-medium text-gray-500 dark:text-gray-400">Top Projects</div>
      </div>
      <div>
        {dataSource.map((developer, index) => (
          <div
            key={developer.actor_id}
            className="px-8 py-4 grid grid-cols-12 gap-2 items-center border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
          >
            <div className="col-span-1">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
            index === 1 ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
              'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                text-xs font-medium`}>{index + 1}</span>
            </div>
            <div className="col-span-3 flex items-center">
              <DeveloperLink className="font-medium" developer={developer} />
            </div>
            <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">
              {developer.total_commit_count.toLocaleString()}
            </div>
            <div className="col-span-6 font-medium text-gray-700 dark:text-gray-300">
              <div className="flex flex-col gap-1">
                {developer.top_repos.slice(0, 2).map(project => (
                  <RepoLinkWidget
                    key={`${developer.actor_id}-${project.repo_id}`}
                    className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-full"
                    repo={project.repo_name}
                  />
                ))}
                {developer.top_repos.length > 2 && (
                  <span className="text-xs text-gray-500">+{developer.top_repos.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default DeveloperRankTableView;

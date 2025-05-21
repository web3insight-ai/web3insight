import { Card } from "@nextui-org/react";
import { Crown } from "lucide-react";

import RepoLinkWidget from "../../../repository/widgets/repo-link";

import type { DeveloperRankViewWidgetProps } from "./typing";
import DeveloperLink from "./DeveloperLink";

function DeveloperRankGridView({ dataSource }: Pick<DeveloperRankViewWidgetProps, "dataSource">) {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm border-none">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5">
        {dataSource.map((dev, index) => (
          <div key={index} className={`relative p-5 ${index === 0 ? 'border-t-4 border-primary' : index === 1 ? 'border-t-4 border-secondary' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <DeveloperLink className="font-semibold" developer={dev} />
                  {index === 0 && <Crown size={14} className="text-primary fill-primary" />}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{dev.total_commit_count.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">score</p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Top Projects</p>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {dev.top_repos.map(proj => (
                  <li key={`${dev.actor_id}-${proj.repo_id}`} className="truncate" title={proj.repo_name}>
                    <RepoLinkWidget repo={proj.repo_name} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default DeveloperRankGridView;

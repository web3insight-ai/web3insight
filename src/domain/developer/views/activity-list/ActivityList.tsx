// import type { ReactNode } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { Code2/*, GitBranch, GitCommit, GitPullRequest, Eye*/ } from "lucide-react";

import type { ActivityListViewWidgetProps } from "./typing";

// const iconMap: Record<string, ReactNode> = {
//   commit: <GitCommit size={16} className="text-primary" />,
//   pull_request: <GitPullRequest size={16} className="text-secondary" />,
//   issue: <div className="w-4 h-4 rounded-full bg-warning flex items-center justify-center text-xs text-white">!</div>,
//   code_review: <Eye size={16} className="text-success" />,
//   fork: <GitBranch size={16} className="text-indigo-500" />,
//   star: <div className="w-4 h-4 text-yellow-500">★</div>,
// };

function ActivityListView({ className, dataSource, title = "Recent Activity" }: ActivityListViewWidgetProps) {
  return (
    <Card className={clsx("bg-white dark:bg-gray-800 shadow-sm border-none", className)}>
      <CardHeader className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {dataSource.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex gap-3">
                <div className="mt-0.5">
                  <Code2 size={16} className="text-gray-500" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dayjs(activity.date).format("MMM D, YYYY, h:mm A")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export default ActivityListView;

import type { ReactNode } from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Card, CardBody, CardHeader, Divider } from "@/components/ui";
import {
  Code2,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Eye,
  Star,
  GitMerge,
  Plus,
  Trash2,
} from "lucide-react";

dayjs.extend(relativeTime);

import type { ActivityListViewWidgetProps } from "./typing";

const iconMap: Record<string, ReactNode> = {
  push: <GitCommit size={14} className="text-white" />,
  pull_request: <GitPullRequest size={14} className="text-white" />,
  pull_request_merged: <GitMerge size={14} className="text-white" />,
  issue: (
    <div className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center text-xs text-white font-semibold">
      !
    </div>
  ),
  review: <Eye size={14} className="text-white" />,
  fork: <GitBranch size={14} className="text-white" />,
  star: <Star size={14} className="text-white" />,
  create: <Plus size={14} className="text-white" />,
  delete: <Trash2 size={14} className="text-white" />,
  default: <Code2 size={14} className="text-white" />,
};

const getActivityIcon = (description: string): ReactNode => {
  if (description.includes("pushed to")) return iconMap.push;
  if (description.includes("merged a pull request"))
    return iconMap.pull_request_merged;
  if (description.includes("pull request")) return iconMap.pull_request;
  if (description.includes("issue")) return iconMap.issue;
  if (description.includes("reviewed")) return iconMap.review;
  if (description.includes("forked")) return iconMap.fork;
  if (description.includes("starred")) return iconMap.star;
  if (description.includes("created")) return iconMap.create;
  if (description.includes("deleted")) return iconMap.delete;
  return iconMap.default;
};

const getActivityColor = (description: string): string => {
  if (description.includes("pushed to")) return "bg-indigo-500";
  if (description.includes("merged a pull request")) return "bg-purple-500";
  if (description.includes("pull request")) return "bg-green-500";
  if (description.includes("issue")) return "bg-orange-500";
  if (description.includes("reviewed")) return "bg-indigo-500";
  if (description.includes("forked")) return "bg-cyan-500";
  if (description.includes("starred")) return "bg-yellow-500";
  if (description.includes("created")) return "bg-emerald-500";
  if (description.includes("deleted")) return "bg-red-500";
  return "bg-gray-500";
};

function ActivityListView({
  className,
  dataSource,
  title = "Recent Activity",
}: ActivityListViewWidgetProps) {
  return (
    <Card
      className={clsx(
        "bg-white dark:bg-gray-800 shadow-sm border-none",
        className,
      )}
    >
      <CardHeader className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title} (Latest {dataSource.length})
        </h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-6">
        <div className="space-y-1">
          {dataSource.map((activity, index) => (
            <div
              key={activity.id}
              className={clsx(
                "relative flex items-start group transition-all duration-200",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-sm rounded-lg p-3 -mx-3",
                "animate-in fade-in-0 slide-in-from-left-4",
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex flex-col items-center mr-4">
                <div
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full shadow-sm border-2 border-white dark:border-gray-800",
                    getActivityColor(activity.description),
                  )}
                >
                  {getActivityIcon(activity.description)}
                </div>
                {index < dataSource.length - 1 && (
                  <div className="w-0.5 h-4 bg-gray-200 dark:bg-gray-700 mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <time className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {dayjs(activity.date).format("MMM D, YYYY • h:mm A")}
                  </time>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {dayjs(activity.date).fromNow()}
                  </span>
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

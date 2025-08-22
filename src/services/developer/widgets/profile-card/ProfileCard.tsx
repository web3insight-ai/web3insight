import clsx from "clsx";
import { Avatar } from "@nextui-org/react";
import { Github } from "lucide-react";

import type { ProfileCardWidgetProps } from "./typing";
import SocialLink from "./SocialLink";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";

function ProfileCard({ className, developer }: ProfileCardWidgetProps) {
  const nickname = developer.nickname || developer.username;
  const { data: githubData, loading: githubLoading } = useGitHubStats(developer.username);

  return (
    <div className={clsx("border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle", className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={developer.avatar}
          className="w-14 h-14"
          isBordered
          radius="full"
          fallback={nickname}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{nickname}</h4>
              {githubLoading ? (
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : githubData?.stats?.rank ? (
                <span className="text-sm font-bold px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                  {githubData.stats.rank}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Github size={12} />
              <SocialLink url={developer.social.github}>@{developer.username}</SocialLink>
            </div>
          </div>

          {/* Stats Row - Enhanced with GitHub Stats */}
          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">{developer.statistics.repository}</strong> Repositories
            </span>

            {/* GitHub Activity Stats or Skeleton */}
            {githubLoading ? (
              <div className="flex items-center gap-6">
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{developer.statistics.codeReview}</strong> Reviews
                </span>
              </div>
            ) : githubData?.stats ? (
              <>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{githubData.stats.totalStars}</strong> Stars
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{githubData.stats.totalCommits}</strong> Commits (2025)
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{githubData.stats.totalPRs}</strong> PRs
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{developer.statistics.codeReview}</strong> Reviews
                </span>
              </>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white text-sm">{developer.statistics.codeReview}</strong> Reviews
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;

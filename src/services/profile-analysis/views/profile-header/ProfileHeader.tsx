import { Avatar } from "@nextui-org/react";
import { Github, Building, ExternalLink } from "lucide-react";
import Link from "next/link";

import type { GitHubUser } from "../../typing";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";

interface ProfileHeaderProps {
  user: GitHubUser;
  githubUsername?: string;
  className?: string;
}



function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function ProfileHeader({ user, githubUsername, className = "" }: ProfileHeaderProps) {
  const { data: githubData } = useGitHubStats(githubUsername || null);
  return (
    <div className={`bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark compact-card ${className}`}>
      <div className="flex items-center gap-3">
        {/* Avatar - Prominent */}
        <Avatar
          src={user.avatar_url}
          name={user.name || user.login}
          className="w-14 h-14"
          isBordered
          radius="full"
        />

        {/* User Info - Full Width Layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {user.name || user.login}
              </h1>
              {githubData?.stats?.rank && (
                <span className="text-sm font-bold px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                  {githubData.stats.rank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={user.html_url || `https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Github size={12} />
                <span>@{user.login}</span>
                <ExternalLink size={10} />
              </Link>
              {user.company && (
                <div className="flex items-center gap-1">
                  <Building size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                    {user.company}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row - Clean and Consistent */}
          <div className="flex items-center gap-6 text-xs">
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.public_repos)}</strong> Repositories
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.followers)}</strong> Followers
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.following)}</strong> Following
            </span>

            {/* GitHub Activity Stats - No Icons for Consistency */}
            {githubData?.stats && (
              <>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{githubData.stats.totalStars}</strong> Stars
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white text-sm">{githubData.stats.totalCommits}</strong> Commits (2025)
                </span>
              </>
            )}
          </div>

          {/* Bio - Compact */}
          {user.bio && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

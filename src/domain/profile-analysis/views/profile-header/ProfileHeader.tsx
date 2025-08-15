import { Avatar } from "@nextui-org/react";
import { Github, Building, ExternalLink } from "lucide-react";
import { Link } from "@remix-run/react";

import type { GitHubUser } from "../../typing";

interface ProfileHeaderProps {
  user: GitHubUser;
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

export function ProfileHeader({ user, className = "" }: ProfileHeaderProps) {
  return (
    <div className={`glass-card dark:glass-card-dark p-3 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Avatar - Prominent */}
        <Avatar
          src={user.avatar_url}
          name={user.name || user.login}
          className="w-14 h-14"
          isBordered
        />

        {/* User Info - Full Width Layout */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {user.name || user.login}
            </h1>
            <Link
              to={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Github size={12} />
              <span>@{user.login}</span>
              <ExternalLink size={10} />
            </Link>
          </div>

          {/* Stats Row - Prominent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.public_repos)}</strong> 项目
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.followers)}</strong> 关注者
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                <strong className="text-gray-900 dark:text-white text-sm">{formatNumber(user.following)}</strong> 关注
              </span>
            </div>
            {user.company && (
              <div className="flex items-center gap-1">
                <Building size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
                  {user.company}
                </span>
              </div>
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

'use client';

import { Github, Star, GitCommit, GitPullRequest, CircleDot, Award } from "lucide-react";

interface GitHubStats {
  rank: string | null;
  totalStars: string;
  totalCommits: string;
  totalPRs: string;
  totalIssues: string;
  contributedTo: string;
}

interface GitHubStatsCardProps {
  username: string;
  stats: GitHubStats;
  className?: string;
}

export default function GitHubStatsCard({ username: _username, stats, className = "" }: GitHubStatsCardProps) {
  const getRankColor = (rank: string | null) => {
    if (!rank) return "text-gray-500 dark:text-gray-400";
    
    if (rank.includes('A')) return "text-green-600 dark:text-green-400";
    if (rank.includes('B')) return "text-blue-600 dark:text-blue-400";
    if (rank.includes('C')) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const formatStatValue = (value: string) => {
    // Convert values like "1.9k" to more readable format
    if (value.includes('k')) {
      return value;
    }
    // Add commas to large numbers
    const num = parseInt(value);
    return num.toLocaleString();
  };

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Github size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">GitHub Stats</h3>
        {stats.rank && (
          <div className={`ml-auto text-xs font-semibold px-2 py-1 rounded ${getRankColor(stats.rank)} bg-gray-100 dark:bg-gray-800`}>
            {stats.rank}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Star size={12} className="text-yellow-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Stars</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStatValue(stats.totalStars)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GitCommit size={12} className="text-green-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Commits</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStatValue(stats.totalCommits)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GitPullRequest size={12} className="text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">PRs</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStatValue(stats.totalPRs)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CircleDot size={12} className="text-orange-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Issues</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStatValue(stats.totalIssues)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Award size={12} className="text-purple-500" />
          <div className="flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400">Contributed to (last year)</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatStatValue(stats.contributedTo)} repositories
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

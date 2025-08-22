'use client';

import { Code } from "lucide-react";
import { useGitHubStats } from '../hooks/useGitHubStats';

interface GitHubLanguagesCompactProps {
  username: string | null;
  className?: string;
}

export default function GitHubLanguagesCompact({ username, className = "" }: GitHubLanguagesCompactProps) {
  const { data: githubData, loading } = useGitHubStats(username);

  if (loading) {
    return (
      <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Programming Languages</h3>
        </div>
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
              <div className="w-10 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!githubData?.languages || githubData.languages.length === 0) {
    return (
      <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Code size={14} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Programming Languages</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">No language data available</p>
        </div>
      </div>
    );
  }

  const LANGUAGE_COLORS = [
    "#3B82F6", // blue
    "#10B981", // emerald
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
  ];

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Code size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Programming Languages</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {githubData.languages.length}
        </span>
      </div>

      {/* Languages List */}
      <div className="space-y-2">
        {githubData.languages.map((lang, index) => (
          <div key={lang.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length] }}
              />
              <span className="text-sm text-gray-900 dark:text-white font-medium">
                {lang.name}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {lang.percentage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

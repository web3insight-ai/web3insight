'use client';

import GitHubStatsCard from './GitHubStatsCard';
import GitHubLanguagesChart from './GitHubLanguagesChart';
import { useGitHubStats } from '../hooks/useGitHubStats';

interface GitHubStatsWidgetProps {
  username: string | null;
  className?: string;
}

export default function GitHubStatsWidget({ username, className = "" }: GitHubStatsWidgetProps) {
  const { data, loading, error } = useGitHubStats(username);

  if (!username) return null;

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Loading skeleton for stats card */}
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-20 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded ml-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="flex-1">
                  <div className="w-12 h-3 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                  <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="flex-1">
                <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton for languages chart */}
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-28 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div className="w-12 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
        <div className="text-center py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Failed to load GitHub stats: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* GitHub Stats Card */}
      {data.stats && (
        <GitHubStatsCard 
          username={data.username} 
          stats={data.stats} 
        />
      )}

      {/* Top Languages Chart */}
      {data.languages && data.languages.length > 0 && (
        <GitHubLanguagesChart 
          languages={data.languages} 
        />
      )}
    </div>
  );
}

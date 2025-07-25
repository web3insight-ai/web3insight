import { Github, Globe, Star, GitFork, AlertCircle } from "lucide-react";

import type { RepositoryHeaderProps } from "./typing";

function RepositoryHeader({ className, repository }: RepositoryHeaderProps) {
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-xl shadow-subtle border border-border dark:border-border-dark p-8 ${className || ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {repository.name}
            </h1>
            {repository.details?.language && (
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {repository.details.language}
              </div>
            )}
          </div>

          {repository.details?.description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mb-4">
              {repository.details.description}
            </p>
          )}

          {/* External Links */}
          <div className="flex items-center gap-4 mb-6">
            <a
              href={`https://github.com/${repository.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Github size={16} />
              <span>View on GitHub</span>
            </a>
            {repository.details?.homepage && (
              <a
                href={repository.details.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                <Globe size={16} />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Topics */}
          {repository.details?.topics && repository.details.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {repository.details.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-surface dark:bg-surface-dark text-xs text-gray-600 dark:text-gray-400 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
            <Star size={18} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.starCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Stars</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <GitFork size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.forksCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Forks</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <AlertCircle size={18} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {repository.openIssuesCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Open Issues</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RepositoryHeader;

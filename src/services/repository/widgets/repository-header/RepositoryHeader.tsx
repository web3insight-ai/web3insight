import { Github, Globe, Star, GitFork, AlertCircle } from "lucide-react";
import { Chip } from "@nextui-org/react";

import type { RepositoryHeaderProps } from "./typing";

function RepositoryHeader({ className, repository }: RepositoryHeaderProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 p-6 ${className || ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {repository.name}
        </h1>
        {repository.details?.language && (
          <Chip
            size="sm"
            variant="flat"
            className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {repository.details.language}
          </Chip>
        )}
      </div>

      {/* Description */}
      {repository.details?.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {repository.details.description}
        </p>
      )}

      {/* External Links */}
      <div className="flex items-center gap-4 mb-4">
        <a
          href={`https://github.com/${repository.name || "unknown/repository"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <Github size={14} />
          <span>View on GitHub</span>
        </a>
        {repository.details?.homepage && (
          <a
            href={repository.details.homepage || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Globe size={14} />
            <span>Website</span>
          </a>
        )}
      </div>

      {/* Topics */}
      {repository.details?.topics && repository.details.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {repository.details.topics.slice(0, 10).map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

      {/* Key Metrics - Simple inline style */}
      <div className="flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Star size={14} />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {repository.starCount.toLocaleString()}
          </span>
          <span>Stars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork size={14} />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {repository.forksCount.toLocaleString()}
          </span>
          <span>Forks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle size={14} />
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {repository.openIssuesCount.toLocaleString()}
          </span>
          <span>Open Issues</span>
        </div>
      </div>
    </div>
  );
}

export default RepositoryHeader;

import { Code2, Cpu } from "lucide-react";
import { useGitHubStats } from "../../hooks/useGitHubStats";

interface ProgrammingLanguagesBarProps {
  username: string;
  className?: string;
}

export function ProgrammingLanguagesBar({ username, className = "" }: ProgrammingLanguagesBarProps) {
  const { data: githubData } = useGitHubStats(username);

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Code2 size={14} className="text-gray-600 dark:text-gray-400" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Programming Languages</h4>
        {githubData?.languages && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {githubData.languages.length}
          </span>
        )}
      </div>

      {githubData?.languages && githubData.languages.length > 0 ? (
        <div className="space-y-3">
          {githubData.languages.slice(0, 5).map((language, index) => {
            const percentage = parseFloat(language.percentage.replace('%', ''));
            const skillLevel = percentage >= 80 ? "Expert" : percentage >= 65 ? "Proficient" : "Familiar";

            return (
              <div key={`language-${language.name}-${index}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {language.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600">
                      {skillLevel}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out bg-primary dark:bg-primary rounded-full"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Loading skeleton */
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                  <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div className="w-1/3 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgrammingLanguagesBar;

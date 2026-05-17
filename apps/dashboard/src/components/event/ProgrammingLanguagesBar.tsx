import { Code2, Cpu } from "lucide-react";
import {
  useGitHubStats,
  type GitHubLanguage,
} from "../../hooks/useGitHubStats";

interface ProgrammingLanguagesBarProps {
  username?: string | null;
  className?: string;
  languages?: GitHubLanguage[];
  loading?: boolean;
}

export function ProgrammingLanguagesBar({
  username,
  className = "",
  languages: providedLanguages,
  loading: forcedLoading,
}: ProgrammingLanguagesBarProps) {
  const shouldFetch = !providedLanguages && !!username;
  const { data: githubData, loading } = useGitHubStats(
    shouldFetch ? (username ?? null) : null,
  );
  const languages = providedLanguages ?? githubData?.languages ?? [];
  const isLoading =
    typeof forcedLoading === "boolean"
      ? forcedLoading
      : shouldFetch
        ? loading
        : false;
  const hasLanguages = languages.length > 0;

  if (!isLoading && !hasLanguages) {
    return null;
  }

  return (
    <div
      className={`rounded-[2px] border border-rule bg-bg-raised/50 p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Code2 size={14} className="text-fg-subtle" />
        <h4 className="text-sm font-medium text-fg">Programming Languages</h4>
        {hasLanguages && (
          <span className="text-xs text-fg-muted ml-auto">
            {languages.length}
          </span>
        )}
      </div>

      {hasLanguages ? (
        <div className="space-y-3">
          {languages.slice(0, 5).map((language, index) => {
            const percentage = parseFloat(language.percentage.replace("%", ""));
            const skillLevel =
              percentage >= 80
                ? "Expert"
                : percentage >= 65
                  ? "Proficient"
                  : "Familiar";

            return (
              <div
                key={`language-${language.name}-${index}`}
                className="space-y-2"
              >
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-fg-muted" />
                    <span className="font-medium text-sm text-fg">
                      {language.name}
                    </span>
                  </div>
                  <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                    <div className="w-[100px]">
                      <span className="inline-block text-xs text-fg bg-rule px-2 py-1 rounded border border-rule">
                        {skillLevel}
                      </span>
                    </div>
                    <div className="w-[56px]">
                      <span className="text-xs text-fg-muted tabular-nums">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative h-2 bg-rule rounded-full overflow-hidden">
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
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 loading-skeleton rounded" />
                  <div className="w-16 h-4 loading-skeleton rounded" />
                </div>
                <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                  <div className="w-[100px] h-4 loading-skeleton rounded" />
                  <div className="w-[56px] h-4 loading-skeleton rounded" />
                </div>
              </div>
              <div className="w-full h-2 bg-rule rounded-full">
                <div className="w-1/3 h-2 loading-skeleton rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProgrammingLanguagesBar;

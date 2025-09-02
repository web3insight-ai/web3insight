
import { Code2, Wrench, Target, Layers, Cpu, Database } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { inferTechnicalStack } from "../../helper";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";

interface TechnicalBreakdownProps {
  ecosystemScores: EcosystemScore[];
  githubUsername?: string;
  className?: string;
}

export function TechnicalBreakdown({ ecosystemScores, githubUsername, className = "" }: TechnicalBreakdownProps) {
  const techStack = inferTechnicalStack(ecosystemScores);
  const { data: githubData } = useGitHubStats(githubUsername || null);

  if (!techStack) return null;

  const { skills, languages, frameworks, mainFocus } = techStack;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Focus */}
      {mainFocus && (
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Technical Focus</h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {mainFocus}
          </p>
        </div>
      )}

      {/* Languages & Skills Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Programming Languages - GitHub API Data Only */}
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
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
              {githubData.languages.map((language, index) => {
                const percentage = parseFloat(language.percentage.replace('%', ''));
                const skillLevel = percentage >= 80 ? "Expert" : percentage >= 65 ? "Proficient" : "Familiar";

                return (
                  <div key={`language-${language.name}-${index}`} className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {language.name}
                        </span>
                      </div>
                      <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                        <div className="w-[100px]">
                          <span className="inline-block text-xs text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600">
                            {skillLevel}
                          </span>
                        </div>
                        <div className="w-[56px]">
                          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                            {percentage}%
                          </span>
                        </div>
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
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="w-16 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                      <div className="w-[100px] h-4 bg-gray-300 dark:bg-gray-700 rounded" />
                      <div className="w-[56px] h-4 bg-gray-300 dark:bg-gray-700 rounded" />
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

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={14} className="text-gray-600 dark:text-gray-400" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Web3 Expertise</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {skills.length}
              </span>
            </div>

            <div className="space-y-3">
              {skills.map((skill, index) => {
                // Calculate skill level based on ecosystem involvement
                const skillLevel = Math.max(50, 95 - (index * 8));
                const expertise = skillLevel >= 85 ? "Advanced" : skillLevel >= 70 ? "Intermediate" : "Developing";

                return (
                  <div key={`skill-${skill}-${index}`} className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {skill}
                        </span>
                      </div>
                      <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                        <div className="w-[100px]">
                          <span className="inline-block text-xs text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600">
                            {expertise}
                          </span>
                        </div>
                        <div className="w-[56px]">
                          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                            {skillLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out bg-primary dark:bg-primary rounded-full"
                        style={{
                          width: `${skillLevel}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Frameworks & Tools */}
      {frameworks && frameworks.length > 0 && (
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={14} className="text-gray-600 dark:text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Frameworks & Tools</h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {frameworks.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((framework, index) => {
              return (
                <div
                  key={`framework-${framework}-${index}`}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wrench size={12} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {framework}
                    </span>
                  </div>

                  <span className="text-xs text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600">
                    {index < 3 ? "Core" : index < 6 ? "Used" : "Familiar"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Summary */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Technical Profile Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {languages.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Programming Languages
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Multi-language proficiency
            </div>
          </div>

          <div className="text-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {skills.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Web3 Specializations
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {skills.length > 8 ? "Broad expertise" : skills.length > 4 ? "Focused expertise" : "Growing expertise"}
            </div>
          </div>

          <div className="text-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {frameworks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Tools & Frameworks
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {frameworks.length > 6 ? "Versatile tooling" : frameworks.length > 3 ? "Standard toolkit" : "Essential tools"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

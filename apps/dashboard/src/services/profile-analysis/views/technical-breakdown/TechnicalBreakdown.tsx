import { Code2, Wrench, Target, Layers, Cpu, Database } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { inferTechnicalStack } from "../../helper";
import { useGitHubStats } from "../../../../hooks/useGitHubStats";

interface TechnicalBreakdownProps {
  ecosystemScores: EcosystemScore[];
  githubUsername?: string;
  className?: string;
}

export function TechnicalBreakdown({
  ecosystemScores,
  githubUsername,
  className = "",
}: TechnicalBreakdownProps) {
  const techStack = inferTechnicalStack(ecosystemScores);
  const { data: githubData, loading: githubLoading } = useGitHubStats(
    githubUsername || null,
  );

  if (!techStack) return null;

  const { skills, frameworks, mainFocus } = techStack;
  const githubLanguages = githubData?.languages ?? [];
  const hasGithubLanguages = githubLanguages.length > 0;
  const shouldRenderGithubLanguages = githubLoading || hasGithubLanguages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Focus */}
      {mainFocus && (
        <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-fg-muted" />
            <h3 className="text-sm font-medium text-fg">Technical Focus</h3>
          </div>
          <p className="text-sm leading-relaxed text-fg">{mainFocus}</p>
        </div>
      )}

      {/* Languages & Skills Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Programming Languages - GitHub API Data Only */}
        {shouldRenderGithubLanguages && (
          <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={14} className="text-fg-muted" />
              <h4 className="text-sm font-medium text-fg">
                Programming Languages
              </h4>
              {hasGithubLanguages && (
                <span className="text-xs text-fg-muted ml-auto">
                  {githubLanguages.length}
                </span>
              )}
            </div>

            {hasGithubLanguages ? (
              <div className="space-y-3">
                {githubLanguages.map((language, index) => {
                  const percentage = parseFloat(
                    language.percentage.replace("%", ""),
                  );
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
                              {percentage}%
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
        )}

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={14} className="text-fg-muted" />
              <h4 className="text-sm font-medium text-fg">Web3 Expertise</h4>
              <span className="text-xs text-fg-muted ml-auto">
                {skills.length}
              </span>
            </div>

            <div className="space-y-3">
              {skills.map((skill, index) => {
                // Calculate skill level based on ecosystem involvement
                const skillLevel = Math.max(50, 95 - index * 8);
                const expertise =
                  skillLevel >= 85
                    ? "Advanced"
                    : skillLevel >= 70
                      ? "Intermediate"
                      : "Developing";

                return (
                  <div key={`skill-${skill}-${index}`} className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-fg-muted" />
                        <span className="font-medium text-sm text-fg">
                          {skill}
                        </span>
                      </div>
                      <div className="ml-auto grid grid-cols-[100px_56px] gap-x-0.5 justify-items-start w-[156px]">
                        <div className="w-[100px]">
                          <span className="inline-block text-xs text-fg bg-rule px-2 py-1 rounded border border-rule">
                            {expertise}
                          </span>
                        </div>
                        <div className="w-[56px]">
                          <span className="text-xs text-fg-muted tabular-nums">
                            {skillLevel}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-2 bg-rule rounded-full overflow-hidden">
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
        <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={14} className="text-fg-muted" />
            <h4 className="text-sm font-medium text-fg">Frameworks & Tools</h4>
            <span className="text-xs text-fg-muted ml-auto">
              {frameworks.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {frameworks.map((framework, index) => {
              return (
                <div
                  key={`framework-${framework}-${index}`}
                  className="border border-rule rounded-[2px] p-3 text-center transition-colors duration-200 hover:bg-bg-sunken"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wrench size={12} className="text-fg-muted" />
                    <span className="font-medium text-sm text-fg">
                      {framework}
                    </span>
                  </div>

                  <span className="text-xs text-fg bg-rule px-2 py-1 rounded border border-rule">
                    {index < 3 ? "Core" : index < 6 ? "Used" : "Familiar"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Summary */}
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">
            Technical Profile Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hasGithubLanguages && (
            <div className="text-center p-3 border border-rule rounded-[2px]">
              <div className="text-lg font-semibold text-fg mb-1">
                {githubLanguages.length}
              </div>
              <div className="text-xs text-fg-muted">Programming Languages</div>
              <div className="text-xs text-fg-muted mt-1">
                Multi-language proficiency
              </div>
            </div>
          )}

          <div className="text-center p-3 border border-rule rounded-[2px]">
            <div className="text-lg font-semibold text-fg mb-1">
              {skills.length}
            </div>
            <div className="text-xs text-fg-muted">Web3 Specializations</div>
            <div className="text-xs text-fg-muted mt-1">
              {skills.length > 8
                ? "Broad expertise"
                : skills.length > 4
                  ? "Focused expertise"
                  : "Growing expertise"}
            </div>
          </div>

          <div className="text-center p-3 border border-rule rounded-[2px]">
            <div className="text-lg font-semibold text-fg mb-1">
              {frameworks.length}
            </div>
            <div className="text-xs text-fg-muted">Tools & Frameworks</div>
            <div className="text-xs text-fg-muted mt-1">
              {frameworks.length > 6
                ? "Versatile tooling"
                : frameworks.length > 3
                  ? "Standard toolkit"
                  : "Essential tools"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

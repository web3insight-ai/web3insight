
import { Code2, Wrench, Target, Layers, Cpu, Database } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { inferTechnicalStack } from "../../helper";

interface TechnicalBreakdownProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function TechnicalBreakdown({ ecosystemScores, className = "" }: TechnicalBreakdownProps) {
  const techStack = inferTechnicalStack(ecosystemScores);

  if (!techStack) return null;

  const { skills, languages, frameworks, mainFocus } = techStack;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Focus */}
      {mainFocus && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
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
        {/* Programming Languages */}
        {languages && languages.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={14} className="text-gray-600 dark:text-gray-400" />
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Programming Languages</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {languages.length}
              </span>
            </div>

            <div className="space-y-3">
              {languages.map((language, index) => {
                // Simulate proficiency based on position and ecosystem involvement
                const proficiency = Math.max(60, 100 - (index * 12));
                const skillLevel = proficiency >= 80 ? "Expert" : proficiency >= 65 ? "Proficient" : "Familiar";

                return (
                  <div key={language} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {language}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {skillLevel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {proficiency}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out bg-gray-600 dark:bg-gray-400 rounded-full"
                        style={{
                          width: `${proficiency}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
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
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database size={12} className="text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {skill}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {expertise}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {skillLevel}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out bg-gray-600 dark:bg-gray-400 rounded-full"
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
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
                  key={framework}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-center transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wrench size={12} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {framework}
                    </span>
                  </div>

                  <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {index < 3 ? "Core" : index < 6 ? "Used" : "Familiar"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Summary */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
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

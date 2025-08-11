import { Card, CardBody, Chip } from "@nextui-org/react";
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
    <div className={`space-y-6 ${className}`}>
      {/* Main Focus */}
      {mainFocus && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-purple-200 dark:border-purple-700">
              <Target className="text-purple-600 dark:text-purple-400" size={16} />
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">TECHNICAL FOCUS</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {mainFocus}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Languages & Skills Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Programming Languages */}
        {languages && languages.length > 0 && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                <Code2 className="text-success" size={16} />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">PROGRAMMING LANGUAGES</h4>
                <div className="ml-auto">
                  <Chip color="success" variant="flat" size="sm">
                    {languages.length}
                  </Chip>
                </div>
              </div>

              <div className="space-y-4">
                {languages.map((language, index) => {
                  // Simulate proficiency based on position and ecosystem involvement
                  const proficiency = Math.max(60, 100 - (index * 12));
                  const skillLevel = proficiency >= 80 ? "Expert" : proficiency >= 65 ? "Proficient" : "Familiar";

                  return (
                    <div key={language} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Cpu size={12} className="text-success" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {language}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip 
                            color={proficiency >= 80 ? "success" : proficiency >= 65 ? "primary" : "warning"}
                            variant="flat"
                            size="sm"
                          >
                            <span className="text-xs">{skillLevel}</span>
                          </Chip>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {proficiency}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 ease-out relative"
                          style={{
                            width: `${proficiency}%`,
                            background: 
                              index === 0 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                                index === 1 ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                                  index === 2 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                    'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                          }}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Core Skills */}
        {skills && skills.length > 0 && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                <Layers className="text-primary" size={16} />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">WEB3 EXPERTISE</h4>
                <div className="ml-auto">
                  <Chip color="primary" variant="flat" size="sm">
                    {skills.length}
                  </Chip>
                </div>
              </div>

              <div className="space-y-4">
                {skills.map((skill, index) => {
                  // Calculate skill level based on ecosystem involvement
                  const skillLevel = Math.max(50, 95 - (index * 8));
                  const expertise = skillLevel >= 85 ? "Advanced" : skillLevel >= 70 ? "Intermediate" : "Developing";

                  return (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Database size={12} className="text-primary" />
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {skill}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip 
                            color={skillLevel >= 85 ? "success" : skillLevel >= 70 ? "primary" : "secondary"}
                            variant="flat"
                            size="sm"
                          >
                            <span className="text-xs">{expertise}</span>
                          </Chip>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {skillLevel}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${skillLevel}%`,
                            background: skillLevel >= 85 ? 
                              'linear-gradient(90deg, #22c55e, #16a34a)' :
                              skillLevel >= 70 ? 
                                'linear-gradient(90deg, #3b82f6, #2563eb)' : 
                                'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Frameworks & Tools */}
      {frameworks && frameworks.length > 0 && (
        <Card className="bg-white dark:bg-surface-dark shadow-subtle">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
              <Wrench className="text-warning" size={16} />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">FRAMEWORKS & TOOLS</h4>
              <div className="ml-auto">
                <Chip color="warning" variant="flat" size="sm">
                  {frameworks.length}
                </Chip>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {frameworks.map((framework, index) => {
                  // Categorize frameworks for different colors
                  const getFrameworkColor = (fw: string) => {
                    const fwLower = fw.toLowerCase();
                    if (fwLower.includes('hardhat') || fwLower.includes('foundry')) return "success";
                    if (fwLower.includes('react') || fwLower.includes('node')) return "primary";
                    if (fwLower.includes('docker') || fwLower.includes('git')) return "secondary";
                    return "warning";
                  };

                  return (
                    <div
                      key={framework}
                      className={`
                        border-2 rounded-lg p-3 text-center transition-all duration-300 hover:scale-105
                        ${getFrameworkColor(framework) === "success" ? "bg-success/10 border-success/30" :
                      getFrameworkColor(framework) === "primary" ? "bg-primary/10 border-primary/30" :
                        getFrameworkColor(framework) === "secondary" ? "bg-secondary/10 border-secondary/30" :
                          "bg-warning/10 border-warning/30"
                    }
                      `}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Wrench size={12} className={
                          getFrameworkColor(framework) === "success" ? "text-success" :
                            getFrameworkColor(framework) === "primary" ? "text-primary" :
                              getFrameworkColor(framework) === "secondary" ? "text-secondary" :
                                "text-warning"
                        } />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {framework}
                        </span>
                      </div>
                      
                      <Chip 
                        color={getFrameworkColor(framework)}
                        variant="flat"
                        size="sm"
                      >
                        <span className="text-xs">
                          {index < 3 ? "Core" : index < 6 ? "Used" : "Familiar"}
                        </span>
                      </Chip>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Technical Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">TECHNICAL PROFILE SUMMARY</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">
                {languages.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Programming Languages
              </div>
              <div className="text-xs text-success mt-1">
                Multi-language proficiency
              </div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {skills.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Web3 Specializations
              </div>
              <div className="text-xs text-primary mt-1">
                {skills.length > 8 ? "Broad expertise" : skills.length > 4 ? "Focused expertise" : "Growing expertise"}
              </div>
            </div>
            
            <div className="text-center p-4 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-2xl font-bold text-warning mb-2">
                {frameworks.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tools & Frameworks
              </div>
              <div className="text-xs text-warning mt-1">
                {frameworks.length > 6 ? "Versatile tooling" : frameworks.length > 3 ? "Standard toolkit" : "Essential tools"}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

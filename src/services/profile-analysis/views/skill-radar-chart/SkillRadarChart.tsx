import { Card, CardBody, Chip } from "@/components/ui";
import { Code, Database, Wrench, Globe, Zap } from "lucide-react";

import type { AIProfile } from "../../typing";

interface SkillRadarChartProps {
  aiProfile: AIProfile;
  className?: string;
}

export function SkillRadarChart({
  aiProfile,
  className = "",
}: SkillRadarChartProps) {
  if (!aiProfile.technicalStack) return null;

  const { skills, languages } = aiProfile.technicalStack;

  // Create skill categories with proper scores based on actual data
  const skillCategories = [
    {
      name: "BLOCKCHAIN",
      icon: Database,
      score: Math.min(85, 60 + (skills?.length || 0) * 5), // Base 60 + skills bonus
      color: "#22c55e",
    },
    {
      name: "LANGUAGES",
      icon: Code,
      score: Math.min(100, Math.max(40, (languages?.length || 0) * 20)), // 20 points per language, min 40
      color: "#3b82f6",
    },
    {
      name: "FRAMEWORKS",
      icon: Wrench,
      score: Math.min(
        90,
        50 +
          (skills?.filter(
            (s) =>
              s.toLowerCase().includes("development") ||
              s.toLowerCase().includes("infrastructure") ||
              s.toLowerCase().includes("node") ||
              s.toLowerCase().includes("data"),
          ).length || 0) *
            15,
      ), // Base 50 + framework bonus
      color: "#f59e0b",
    },
    {
      name: "WEB3",
      icon: Globe,
      score: Math.max(50, aiProfile.web3_involvement?.score || 0),
      color: "#8b5cf6",
    },
    {
      name: "DEFI",
      icon: Zap,
      score: Math.min(
        80,
        45 +
          (skills?.filter(
            (s) =>
              s.toLowerCase().includes("cross-chain") ||
              s.toLowerCase().includes("oracle") ||
              s.toLowerCase().includes("indexing") ||
              s.toLowerCase().includes("smart"),
          ).length || 0) *
            10,
      ), // Base 45 + DeFi-related skills
      color: "#ef4444",
    },
  ];

  return (
    <Card
      className={`bg-white dark:bg-surface-dark shadow-subtle ${className}`}
    >
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-border dark:border-border-dark">
          <Code className="text-primary" size={16} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            SKILL RADAR
          </h3>
          <div className="ml-auto">
            <Chip color="primary" variant="flat" size="sm">
              ANALYSIS
            </Chip>
          </div>
        </div>

        <div className="relative">
          {/* Radar Chart Container */}
          <div className="relative w-full h-64 flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Concentric circles */}
                {[1, 2, 3, 4, 5].map((ring) => (
                  <div
                    key={ring}
                    className="absolute border border-gray-300 dark:border-gray-500"
                    style={{
                      width: `${ring * 20}px`,
                      height: `${ring * 20}px`,
                      left: `${-ring * 10}px`,
                      top: `${-ring * 10}px`,
                      borderRadius: "50%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Skill Points */}
            {skillCategories.map((skill, index) => {
              const angle = index * 72 - 90; // 360/5 = 72 degrees between points
              const radian = (angle * Math.PI) / 180;
              const radius = (skill.score / 100) * 90; // Max radius 90px
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;

              return (
                <div
                  key={`skill-radar-${skill.name}-${index}`}
                  className="absolute flex flex-col items-center"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    left: "50%",
                    top: "50%",
                    marginLeft: "-25px",
                    marginTop: "-25px",
                  }}
                >
                  <div
                    className="w-6 h-6 border-2 border-white dark:border-gray-800 flex items-center justify-center rounded-sm"
                    style={{ backgroundColor: skill.color }}
                  >
                    <skill.icon size={12} className="text-white" />
                  </div>
                  <div
                    className="text-xs mt-1 text-center min-w-16 font-medium"
                    style={{ color: skill.color }}
                  >
                    {skill.name}
                  </div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {skill.score}
                  </div>
                </div>
              );
            })}

            {/* Center point */}
            <div className="absolute w-4 h-4 bg-white dark:bg-surface-dark border-2 border-gray-800 dark:border-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {skillCategories.map((skill, index) => (
              <div
                key={`skill-legend-${skill.name}-${index}`}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 border border-white dark:border-gray-800"
                  style={{ backgroundColor: skill.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

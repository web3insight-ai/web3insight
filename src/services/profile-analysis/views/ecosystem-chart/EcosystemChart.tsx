import { Card, CardBody, Chip } from "@/components/ui";
import { Trophy, TrendingUp, Target } from "lucide-react";

import type { AIProfile } from "../../typing";

interface EcosystemChartProps {
  aiProfile: AIProfile;
  className?: string;
}

export function EcosystemChart({
  aiProfile,
  className = "",
}: EcosystemChartProps) {
  if (!aiProfile.web3Ecosystems?.top3) return null;

  const { top3 } = aiProfile.web3Ecosystems;
  const maxScore = Math.max(...top3.map((eco) => eco.score));

  const colors = ["warning", "primary", "success"] as const;

  return (
    <Card
      className={`bg-white dark:bg-surface-dark shadow-subtle ${className}`}
    >
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-border dark:border-border-dark">
          <Trophy className="text-warning" size={16} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            ECOSYSTEM IMPACT
          </h3>
          <div className="ml-auto">
            <Chip color="warning" variant="flat" size="sm">
              TOP 3
            </Chip>
          </div>
        </div>

        <div className="space-y-4">
          {top3.map((ecosystem, index) => {
            const barWidth = (ecosystem.score / maxScore) * 100;
            const color = colors[index];

            return (
              <div
                key={`ecosystem-chart-${ecosystem.name}-${index}`}
                className="space-y-2"
              >
                {/* Ecosystem Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Chip color={color} variant="flat" size="sm">
                      <span className="text-xs font-bold">
                        #{ecosystem.rank}
                      </span>
                    </Chip>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {ecosystem.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {ecosystem.score}
                  </span>
                </div>

                {/* Visual Bar Chart */}
                <div className="relative h-8 bg-gray-50 dark:bg-surface-dark border-2 border-border dark:border-border-dark rounded-lg overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out flex items-center justify-center relative"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor:
                        color === "warning"
                          ? "#ffdd00"
                          : color === "primary"
                            ? "#3b82f6"
                            : "#22c55e",
                      minWidth: barWidth > 0 ? "20px" : "0px",
                    }}
                  >
                    {/* Pixel pattern overlay */}
                    <div className="absolute inset-0 opacity-20">
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                          0deg,
                          transparent,
                          transparent 1px,
                          rgba(0,0,0,0.1) 1px,
                          rgba(0,0,0,0.1) 2px
                        )`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-black relative z-10">
                      {ecosystem.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Activity Indicators */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Target size={10} />
                    <span>
                      {new Date().getFullYear() -
                        new Date(ecosystem.firstActivityAt).getFullYear()}
                      Y EXP
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} />
                    <span>
                      {Math.floor(
                        (Date.now() -
                          new Date(ecosystem.lastActivityAt).getTime()) /
                          (1000 * 60 * 60 * 24 * 30),
                      )}
                      M AGO
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Ecosystems Summary */}
        {aiProfile.web3Ecosystems?.otherEcosystems &&
          aiProfile.web3Ecosystems.otherEcosystems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border dark:border-border-dark">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Other Ecosystems
              </span>
              <Chip size="sm" variant="light">
                {aiProfile.web3Ecosystems.otherEcosystems.length}
              </Chip>
            </div>

            <div className="flex flex-wrap gap-2">
              {aiProfile.web3Ecosystems.otherEcosystems
                .slice(0, 6)
                .map((eco, index) => (
                  <Chip
                    key={`other-ecosystem-${eco.name}-${index}`}
                    variant="bordered"
                    size="sm"
                    className="text-xs"
                  >
                    {eco.name} ({eco.repoCount})
                  </Chip>
                ))}
              {aiProfile.web3Ecosystems.otherEcosystems.length > 6 && (
                <Chip variant="light" size="sm" className="text-xs">
                    +{aiProfile.web3Ecosystems.otherEcosystems.length - 6} more
                </Chip>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

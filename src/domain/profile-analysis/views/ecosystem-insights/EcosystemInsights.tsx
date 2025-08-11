import { Card, CardBody, Chip } from "@nextui-org/react";
import { Trophy, Activity, TrendingUp, Calendar, Target, BarChart3 } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { processEcosystemData, calculateEcosystemRankings, formatNumber } from "../../helper";

interface EcosystemInsightsProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function EcosystemInsights({ ecosystemScores, className = "" }: EcosystemInsightsProps) {
  const processedData = processEcosystemData(ecosystemScores);
  const rankings = calculateEcosystemRankings(ecosystemScores);
  
  if (!processedData || !rankings) return null;

  const { top5, stats } = processedData;
  const maxScore = Math.max(...top5.map(eco => eco.score));

  const colors = ["success", "primary", "warning", "secondary", "danger"] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BarChart3 size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Web3 Ecosystem Analysis
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.totalEcosystems}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ecosystems</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{formatNumber(stats.totalScore)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{formatNumber(stats.topScore)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{formatNumber(Math.round(stats.averageScore))}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Top 5 Ecosystems Chart */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
            <Trophy className="text-warning" size={16} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">TOP 5 ECOSYSTEM IMPACT</h3>
            <div className="ml-auto">
              <Chip color="warning" variant="flat" size="sm">
                RANKED
              </Chip>
            </div>
          </div>

          <div className="space-y-6">
            {top5.map((ecosystem, index) => {
              const barWidth = (ecosystem.score / maxScore) * 100;
              const color = colors[index];

              return (
                <div key={ecosystem.name} className="space-y-3">
                  {/* Ecosystem Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Chip color={color} variant="flat" size="sm">
                        <span className="text-xs font-bold">#{ecosystem.rank}</span>
                      </Chip>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {ecosystem.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {ecosystem.repoCount} repositories
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {ecosystem.percentage.toFixed(1)}% of total activity
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xl text-gray-900 dark:text-white">
                        {formatNumber(ecosystem.score)}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="relative h-8 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out flex items-center justify-center relative"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: 
                          color === "success" ? "#22c55e" :
                            color === "primary" ? "#3b82f6" :
                              color === "warning" ? "#f59e0b" :
                                color === "secondary" ? "#8b5cf6" :
                                  "#ef4444",
                        minWidth: barWidth > 0 ? '40px' : '0px',
                      }}
                    >
                      {/* Animated pattern overlay */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 2px,
                            rgba(255,255,255,0.1) 2px,
                            rgba(255,255,255,0.1) 4px
                          )`,
                        }} 
                      />
                      <span className="text-xs font-bold text-white relative z-10 mix-blend-difference">
                        {ecosystem.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Started: {new Date(ecosystem.firstActivityAt).getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={10} />
                      <span>Recent: {new Date(ecosystem.lastActivityAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Ecosystem Distribution Grid */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
            <Target className="text-primary" size={16} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ECOSYSTEM DISTRIBUTION</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rankings.slice(0, 9).map((eco) => (
              <div key={eco.ecosystem} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Chip 
                    color={eco.isActive ? "success" : "default"}
                    variant="flat" 
                    size="sm"
                  >
                    <span className="text-xs">#{eco.rank}</span>
                  </Chip>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatNumber(eco.score)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {eco.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {eco.ecosystem}
                </h4>
                
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Repositories:</span>
                    <span>{eco.repos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Score:</span>
                    <span>{Math.round(eco.avgRepoScore)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {eco.isActive ? (
                      <>
                        <TrendingUp size={10} className="text-success" />
                        <span className="text-success">Active</span>
                      </>
                    ) : (
                      <>
                        <Activity size={10} className="text-gray-400" />
                        <span>Historical</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rankings.length > 9 && (
            <div className="mt-4 text-center">
              <Chip variant="bordered" size="sm" className="text-xs">
                +{rankings.length - 9} more ecosystems
              </Chip>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

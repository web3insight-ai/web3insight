import { useState } from "react";
import {
  Trophy,
  Activity,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";

import type { EcosystemScore } from "../../typing";
import {
  processEcosystemData,
  calculateEcosystemRankings,
  formatNumber,
} from "../../helper";

interface EcosystemInsightsProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function EcosystemInsights({
  ecosystemScores,
  className = "",
}: EcosystemInsightsProps) {
  const [showAllEcosystems, setShowAllEcosystems] = useState(false);
  const processedData = processEcosystemData(ecosystemScores);
  const rankings = calculateEcosystemRankings(ecosystemScores);

  if (!processedData || !rankings) return null;

  const { top5, stats } = processedData;
  const maxScore = Math.max(...top5.map((eco) => eco.score));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats Overview */}
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">
            Web3 Ecosystem Analysis
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-lg font-semibold text-fg">
              {stats.totalEcosystems}
            </p>
            <p className="text-xs text-fg-muted">Ecosystems</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-fg">
              {formatNumber(stats.totalScore)}
            </p>
            <p className="text-xs text-fg-muted">Total Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-fg">
              {formatNumber(stats.topScore)}
            </p>
            <p className="text-xs text-fg-muted">Top Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-fg">
              {formatNumber(Math.round(stats.averageScore))}
            </p>
            <p className="text-xs text-fg-muted">Avg Score</p>
          </div>
        </div>
      </div>

      {/* Top 5 Ecosystems Chart */}
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">
            Top 5 Ecosystem Impact
          </h3>
        </div>

        <div className="space-y-4">
          {top5.map((ecosystem, index) => {
            const barWidth = (ecosystem.score / maxScore) * 100;

            return (
              <div
                key={`ecosystem-top5-${ecosystem.name}-${index}`}
                className="space-y-2"
              >
                {/* Ecosystem Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-fg-muted w-6">
                      #{ecosystem.rank}
                    </span>
                    <div>
                      <h4 className="font-medium text-fg text-sm">
                        {ecosystem.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-fg-muted">
                          {ecosystem.repoCount} repositories
                        </span>
                        <span className="text-xs text-fg-muted">•</span>
                        <span className="text-xs text-fg-muted">
                          {ecosystem.percentage.toFixed(1)}% of total activity
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-fg">
                      {formatNumber(ecosystem.score)}
                    </span>
                    <p className="text-xs text-fg-muted">Score</p>
                  </div>
                </div>

                {/* Visual Bar Chart */}
                <div className="relative h-2 bg-rule rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out bg-primary dark:bg-primary rounded-full"
                    style={{
                      width: `${barWidth}%`,
                      minWidth: barWidth > 0 ? "8px" : "0px",
                    }}
                  />
                </div>

                {/* Activity Timeline */}
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>
                      Started:{" "}
                      {new Date(ecosystem.firstActivityAt).getFullYear()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={10} />
                    <span>
                      Recent:{" "}
                      {new Date(ecosystem.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ecosystem Distribution Grid */}
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-fg-muted" />
          <h3 className="text-sm font-medium text-fg">
            Ecosystem Distribution
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(showAllEcosystems ? rankings : rankings.slice(0, 9)).map(
            (eco, index) => (
              <div
                key={`ecosystem-distribution-${eco.ecosystem}-${index}`}
                className="border border-rule rounded-[2px] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-fg-muted">
                    #{eco.rank}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-fg">
                      {formatNumber(eco.score)}
                    </div>
                    <div className="text-xs text-fg-muted">
                      {eco.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-sm text-fg mb-2">
                  {eco.ecosystem}
                </h4>

                <div className="space-y-1 text-xs text-fg-muted">
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
                        <TrendingUp size={10} className="text-fg-muted" />
                        <span className="text-fg-muted">Active</span>
                      </>
                    ) : (
                      <>
                        <Activity size={10} className="text-fg-subtle" />
                        <span>Historical</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {rankings.length > 9 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllEcosystems(!showAllEcosystems)}
              className="text-xs text-fg-muted hover:text-fg dark:hover:text-fg transition-colors duration-200"
            >
              {showAllEcosystems
                ? "Show less"
                : `+${rankings.length - 9} more ecosystems`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

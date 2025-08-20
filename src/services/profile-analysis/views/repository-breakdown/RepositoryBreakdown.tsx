import { Card, CardBody, Chip } from "@nextui-org/react";
import { GitBranch, Star, Activity, Calendar, TrendingUp, Code2, Package } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { getTopRepositories, formatNumber } from "../../helper";

interface RepositoryBreakdownProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function RepositoryBreakdown({ ecosystemScores, className = "" }: RepositoryBreakdownProps) {
  const topRepos = getTopRepositories(ecosystemScores, 12);

  if (!topRepos.length) return null;

  const maxScore = Math.max(...topRepos.map(repo => repo.score));

  // Group repositories by ecosystem for distribution view
  const reposByEcosystem = ecosystemScores.reduce((acc, eco) => {
    if (eco.ecosystem !== "ALL") {
      acc[eco.ecosystem] = {
        count: eco.repos.length,
        totalScore: eco.total_score,
        avgScore: eco.repos.length > 0 ? eco.total_score / eco.repos.length : 0,
        topRepo: eco.repos.sort((a, b) => b.score - a.score)[0],
      };
    }
    return acc;
  }, {} as Record<string, {
    count: number;
    totalScore: number;
    avgScore: number;
    topRepo: { repo_name: string; score: number; last_activity_at: string; first_activity_at: string };
  }>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Repositories */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-border dark:border-border-dark">
            <GitBranch className="text-success" size={16} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">TOP REPOSITORY CONTRIBUTIONS</h3>
            <div className="ml-auto">
              <Chip color="success" variant="flat" size="sm">
                {topRepos.length} REPOS
              </Chip>
            </div>
          </div>

          <div className="space-y-4">
            {topRepos.map((repo, index) => {
              const scorePercentage = (repo.score / maxScore) * 100;
              const isRecent = new Date(repo.last_activity_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
              const repoDisplayName = repo.repo_name.split('/').pop() || repo.repo_name;

              return (
                <div key={`${repo.ecosystem}-${repo.repo_name}`} className="bg-gray-50 dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          color={
                            index === 0 ? "warning" :
                              index === 1 ? "primary" :
                                index === 2 ? "success" :
                                  "default"
                          }
                          variant="flat"
                          size="sm"
                        >
                          <span className="text-xs font-bold">#{index + 1}</span>
                        </Chip>

                        <Chip
                          color="secondary"
                          variant="bordered"
                          size="sm"
                        >
                          <span className="text-xs">{repo.ecosystem}</span>
                        </Chip>

                        {isRecent && (
                          <Chip color="danger" variant="flat" size="sm">
                            <span className="text-xs">🔥 ACTIVE</span>
                          </Chip>
                        )}
                      </div>

                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 truncate">
                        {repoDisplayName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {repo.repo_name}
                      </p>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-primary mb-1">
                        {formatNumber(repo.score)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {scorePercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="relative h-3 bg-gray-100 dark:bg-surface-dark rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out relative"
                      style={{
                        width: `${scorePercentage}%`,
                        background: scorePercentage > 80 ?
                          'linear-gradient(90deg, #22c55e, #16a34a)' :
                          scorePercentage > 60 ?
                            'linear-gradient(90deg, #3b82f6, #2563eb)' :
                            scorePercentage > 40 ?
                              'linear-gradient(90deg, #f59e0b, #d97706)' :
                              'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Activity Period */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Started: {new Date(repo.first_activity_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={10} />
                      <span>Latest: {new Date(repo.last_activity_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Repository Distribution by Ecosystem */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-border dark:border-border-dark">
            <Package className="text-primary" size={16} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ECOSYSTEM REPOSITORY DISTRIBUTION</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(reposByEcosystem)
              .sort(([, a], [, b]) => b.totalScore - a.totalScore)
              .slice(0, 9)
              .map(([ecosystem, data], index) => {
                const isHighContribution = data.avgScore > 100;

                return (
                  <div key={`repo-breakdown-${ecosystem || index}`} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-dark border border-border dark:border-border-dark rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Chip
                        color={isHighContribution ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        <span className="text-xs font-bold">{data.count}</span>
                      </Chip>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">
                          {formatNumber(data.totalScore)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Total Score
                        </div>
                      </div>
                    </div>

                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[2.5rem]">
                      {ecosystem}
                    </h4>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(data.avgScore)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Top Repository:</div>
                        <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Star size={8} className="text-warning" />
                            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {data.topRepo.repo_name.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Score: {formatNumber(data.topRepo.score)}
                            </span>
                            <div className="flex items-center gap-1">
                              <TrendingUp size={8} className="text-success" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(data.topRepo.last_activity_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) ? 'Active' : 'Historical'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardBody>
      </Card>

      {/* Repository Activity Insights */}
      <Card className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code2 size={20} className="text-success" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">REPOSITORY INSIGHTS</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {topRepos.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total Repositories
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Object.keys(reposByEcosystem).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Ecosystems
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {topRepos.filter(repo =>
                  new Date(repo.last_activity_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                ).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Active Repos
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {formatNumber(topRepos.reduce((sum, repo) => sum + repo.score, 0))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Combined Score
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

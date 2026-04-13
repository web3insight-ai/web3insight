import { Card, CardBody, Chip } from "@/components/ui";
import {
  GitBranch,
  Activity,
  Calendar,
  TrendingUp,
  Star,
  Award,
} from "lucide-react";

import type { EcosystemScore } from "../../typing";
import {
  getTopRepositories,
  processEcosystemData,
  formatNumber,
} from "../../helper";

interface RepositoryContributionsProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function RepositoryContributions({
  ecosystemScores,
  className = "",
}: RepositoryContributionsProps) {
  const topRepos = getTopRepositories(ecosystemScores, 10);
  const processedData = processEcosystemData(ecosystemScores);

  if (!topRepos.length || !processedData) return null;

  const maxScore = Math.max(...topRepos.map((repo) => repo.score));
  const { detailed } = processedData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Repository Contributions */}
      <Card className="bg-bg-raised border border-rule rounded-[2px]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-rule">
            <GitBranch className="text-success" size={16} />
            <h3 className="text-sm font-semibold text-fg">
              TOP REPOSITORY CONTRIBUTIONS
            </h3>
            <div className="ml-auto">
              <Chip color="success" variant="flat" size="sm">
                {topRepos.length}
              </Chip>
            </div>
          </div>

          <div className="space-y-4">
            {topRepos.map((repo, index) => {
              const scorePercentage = (repo.score / maxScore) * 100;
              const isRecent =
                new Date(repo.last_activity_at) >
                new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={`${repo.ecosystem}-${repo.repo_name}`}
                  className="bg-bg-raised border border-rule rounded-[2px] p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          color={
                            index === 0
                              ? "warning"
                              : index === 1
                                ? "primary"
                                : index === 2
                                  ? "success"
                                  : "default"
                          }
                          variant="flat"
                          size="sm"
                        >
                          <span className="text-xs font-bold">
                            #{index + 1}
                          </span>
                        </Chip>

                        {isRecent && (
                          <Chip color="danger" variant="flat" size="sm">
                            <span className="text-xs">🔥 ACTIVE</span>
                          </Chip>
                        )}

                        {index < 3 && (
                          <Chip color="secondary" variant="flat" size="sm">
                            <Star size={10} />
                            <span className="text-xs ml-1">TOP 3</span>
                          </Chip>
                        )}
                      </div>

                      <h4 className="font-semibold text-sm text-fg mb-1 truncate">
                        {repo.repo_name.split("/").pop()?.toUpperCase()}
                      </h4>
                      <p className="text-xs text-fg-muted truncate mb-1">
                        {repo.repo_name}
                      </p>
                      <Chip color="primary" variant="bordered" size="sm">
                        <span className="text-xs">{repo.ecosystem}</span>
                      </Chip>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="text-xl font-mono font-bold text-accent mb-1 tabular-nums">
                        {formatNumber(repo.score)}
                      </div>
                      <div className="text-xs text-fg-muted">
                        {scorePercentage.toFixed(1)}% of max
                      </div>
                    </div>
                  </div>

                  {/* Score Progress Bar */}
                  <div className="relative h-4 bg-rule rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out flex items-center justify-center relative"
                      style={{
                        width: `${scorePercentage}%`,
                        background:
                          scorePercentage > 80
                            ? "#22c55e"
                            : scorePercentage > 60
                              ? "#3b82f6"
                              : scorePercentage > 40
                                ? "#f59e0b"
                                : "#8b5cf6",
                        minWidth: scorePercentage > 0 ? "40px" : "0px",
                      }}
                    >
                      {/* Pixel pattern overlay */}
                      <div className="absolute inset-0 opacity-30">
                        <div
                          className="w-full h-full"
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
                      </div>
                      <span className="text-xs font-bold text-white relative z-10 mix-blend-difference">
                        {scorePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Activity Period */}
                  <div className="flex items-center justify-between text-xs text-fg-muted">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>
                        Started{" "}
                        {new Date(repo.first_activity_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={10} />
                      <span>
                        Latest{" "}
                        {new Date(repo.last_activity_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Ecosystem Distribution */}
      <Card className="bg-bg-raised border border-rule rounded-[2px]">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-rule">
            <TrendingUp className="text-accent" size={16} />
            <h4 className="text-sm font-semibold text-fg">
              ECOSYSTEM CONTRIBUTION BREAKDOWN
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detailed.map((ecosystem, index) => (
              <div
                key={`repo-contributions-${ecosystem.ecosystem}-${index}`}
                className="bg-bg-raised border border-rule rounded-[2px] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {index < 3 && <Award size={12} className="text-warning" />}
                    <span className="font-medium text-xs text-fg line-clamp-1">
                      {ecosystem.ecosystem}
                    </span>
                  </div>
                  <Chip
                    color={
                      index === 0
                        ? "success"
                        : index === 1
                          ? "primary"
                          : index === 2
                            ? "warning"
                            : "default"
                    }
                    variant="flat"
                    size="sm"
                  >
                    <span className="text-xs">
                      {formatNumber(ecosystem.score)}
                    </span>
                  </Chip>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-muted">Repositories:</span>
                    <span className="text-xs font-semibold text-fg">
                      {ecosystem.repos.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-muted">
                      Top Repository:
                    </span>
                    <span className="text-xs font-semibold text-fg">
                      {Math.max(...ecosystem.repos.map((r) => r.score))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-muted">Avg Score:</span>
                    <span className="text-xs font-semibold text-fg">
                      {Math.round(ecosystem.score / ecosystem.repos.length)}
                    </span>
                  </div>
                </div>

                {/* Show top repository for this ecosystem */}
                {ecosystem.repos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rule">
                    <div className="text-xs text-fg-muted mb-1">
                      Top Contribution:
                    </div>
                    <div className="bg-bg-raised border border-rule rounded p-2">
                      <div className="text-xs font-medium text-fg truncate">
                        {ecosystem.repos
                          .sort((a, b) => b.score - a.score)[0]
                          .name.split("/")
                          .pop()}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-success">
                          {formatNumber(
                            ecosystem.repos.sort((a, b) => b.score - a.score)[0]
                              .score,
                          )}
                        </span>
                        <span className="text-xs text-fg-muted">
                          {new Date(
                            ecosystem.repos.sort((a, b) => b.score - a.score)[0]
                              .lastActivityAt,
                          ) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                            ? "🔥"
                            : "📚"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Contribution Insights */}
      <Card className="bg-accent-subtle border border-success/20">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award size={20} className="text-success" />
            <h3 className="text-sm font-semibold text-fg">
              CONTRIBUTION INSIGHTS
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {
                  topRepos.filter(
                    (repo) =>
                      new Date(repo.last_activity_at) >
                      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
              <div className="text-xs text-fg-muted">Active Repositories</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-accent mb-1 tabular-nums">
                {new Set(topRepos.map((repo) => repo.ecosystem)).size}
              </div>
              <div className="text-xs text-fg-muted">Ecosystem Diversity</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {Math.round(
                  topRepos.reduce((sum, repo) => sum + repo.score, 0) /
                    topRepos.length,
                )}
              </div>
              <div className="text-xs text-fg-muted">Average Impact</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {formatNumber(Math.max(...topRepos.map((repo) => repo.score)))}
              </div>
              <div className="text-xs text-fg-muted">Peak Contribution</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

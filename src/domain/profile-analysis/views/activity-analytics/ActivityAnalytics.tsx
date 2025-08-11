import { Card, CardBody, Chip } from "@nextui-org/react";
import { Calendar, TrendingUp, Activity, Clock, Zap, BarChart } from "lucide-react";

import type { EcosystemScore } from "../../typing";
import { calculateActivityTimeline, formatNumber } from "../../helper";

interface ActivityAnalyticsProps {
  ecosystemScores: EcosystemScore[];
  className?: string;
}

export function ActivityAnalytics({ ecosystemScores, className = "" }: ActivityAnalyticsProps) {
  const timelineData = calculateActivityTimeline(ecosystemScores);
  
  if (!timelineData) return null;

  const { firstActivity, lastActivity, totalDaysActive, timelineData: yearlyData, totalEcosystems } = timelineData;
  
  // Calculate some interesting metrics
  const yearsActive = yearlyData.length;
  const mostActiveYear = yearlyData.reduce((max, year) => year.totalScore > max.totalScore ? year : max, yearlyData[0]);
  const recentActivity = new Date(lastActivity) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const maxYearScore = Math.max(...yearlyData.map(y => y.totalScore));

  // Calculate activity intensity levels
  const getActivityLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { level: "Very High", color: "success" as const };
    if (percentage >= 60) return { level: "High", color: "primary" as const };
    if (percentage >= 40) return { level: "Medium", color: "warning" as const };
    if (percentage >= 20) return { level: "Low", color: "secondary" as const };
    return { level: "Minimal", color: "default" as const };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Activity Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activity Timeline Analysis
            </h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round(totalDaysActive / 365)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Years Active
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {yearsActive}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Contributing Years
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-warning mb-1">
                {totalEcosystems}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Ecosystems
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {mostActiveYear.year}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Peak Year
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${recentActivity ? 'text-success' : 'text-gray-500'}`}>
                {recentActivity ? 'Active' : 'Dormant'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Current Status
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Activity Timeline Chart */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
            <BarChart className="text-primary" size={16} />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">YEARLY ACTIVITY BREAKDOWN</h3>
            <div className="ml-auto">
              <Chip color="primary" variant="flat" size="sm">
                {yearlyData.length} YEARS
              </Chip>
            </div>
          </div>

          <div className="space-y-4">
            {yearlyData.map((year) => {
              const scorePercentage = (year.totalScore / maxYearScore) * 100;
              const activityInfo = getActivityLevel(year.totalScore, maxYearScore);
              const isCurrentYear = year.year === new Date().getFullYear();
              
              return (
                <div key={year.year} className="space-y-3">
                  {/* Year Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {year.year}
                        </span>
                        {isCurrentYear && (
                          <Chip color="success" variant="flat" size="sm">
                            <span className="text-xs">CURRENT</span>
                          </Chip>
                        )}
                        {year.year === mostActiveYear.year && (
                          <Chip color="warning" variant="flat" size="sm">
                            <span className="text-xs">🏆 PEAK</span>
                          </Chip>
                        )}
                      </div>
                      <Chip color={activityInfo.color} variant="bordered" size="sm">
                        <span className="text-xs">{activityInfo.level}</span>
                      </Chip>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatNumber(year.totalScore)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total Score
                      </div>
                    </div>
                  </div>

                  {/* Activity Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Activity size={12} className="text-success" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {year.ecosystems} ecosystem{year.ecosystems !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-primary" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {year.repos} repositories
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} className="text-warning" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(year.totalScore / year.repos)} avg score
                      </span>
                    </div>
                  </div>

                  {/* Visual Activity Bar */}
                  <div className="relative h-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full transition-all duration-1000 ease-out flex items-center justify-center relative"
                      style={{
                        width: `${scorePercentage}%`,
                        background: 
                          activityInfo.color === "success" ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                            activityInfo.color === "primary" ? 'linear-gradient(90deg, #3b82f6, #2563eb)' :
                              activityInfo.color === "warning" ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                activityInfo.color === "secondary" ? 'linear-gradient(90deg, #8b5cf6, #7c3aed)' :
                                  'linear-gradient(90deg, #6b7280, #4b5563)',
                        minWidth: scorePercentage > 0 ? '30px' : '0px',
                      }}
                    >
                      {/* Activity pulse effect for high activity years */}
                      {activityInfo.color === "success" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse" />
                      )}
                      
                      <span className="text-xs font-bold text-white relative z-10 mix-blend-difference">
                        {scorePercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Activity Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Journey Timeline */}
        <Card className="bg-white dark:bg-surface-dark shadow-subtle">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
              <Clock className="text-secondary" size={16} />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">DEVELOPMENT JOURNEY</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-success" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Started</span>
                </div>
                <span className="text-sm font-bold text-success">
                  {new Date(firstActivity).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Latest Activity</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {new Date(lastActivity).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-warning" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Peak Period</span>
                </div>
                <span className="text-sm font-bold text-warning">
                  {mostActiveYear.year} ({formatNumber(mostActiveYear.totalScore)})
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-secondary" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Status</span>
                </div>
                <Chip 
                  color={recentActivity ? "success" : "default"}
                  variant="flat"
                  size="sm"
                >
                  <span className="text-xs">
                    {recentActivity ? "🔥 Active Developer" : "📚 Historical Contributor"}
                  </span>
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Activity Patterns */}
        <Card className="bg-white dark:bg-surface-dark shadow-subtle">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
              <TrendingUp className="text-warning" size={16} />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">CONTRIBUTION PATTERNS</h3>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Consistency Score
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Based on year-over-year activity
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {yearsActive > 3 ? "High" : yearsActive > 1 ? "Medium" : "Building"}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Growth Trajectory
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Ecosystem expansion over time
                  </div>
                  <div className="text-lg font-bold text-success">
                    {totalEcosystems > 10 ? "Diverse" : totalEcosystems > 5 ? "Expanding" : "Focused"}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Impact Level
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Peak year contribution intensity
                  </div>
                  <div className={`text-lg font-bold ${mostActiveYear.totalScore > 2000 ? 'text-success' : mostActiveYear.totalScore > 1000 ? 'text-warning' : 'text-secondary'}`}>
                    {mostActiveYear.totalScore > 2000 ? "High Impact" : mostActiveYear.totalScore > 1000 ? "Solid Contributor" : "Steady Builder"}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

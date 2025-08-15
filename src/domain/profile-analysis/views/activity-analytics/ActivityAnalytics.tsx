
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
    <div className={`space-y-4 ${className}`}>
      {/* Activity Overview */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Activity Timeline Analysis
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {Math.round(totalDaysActive / 365)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Years Active
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {yearsActive}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Contributing Years
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {totalEcosystems}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Ecosystems
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {mostActiveYear.year}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Peak Year
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {recentActivity ? 'Active' : 'Dormant'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Current Status
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline Chart */}
      <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
        <div className="flex items-center gap-2 mb-4">
          <BarChart size={14} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Yearly Activity Breakdown</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {yearlyData.length} years
          </span>
        </div>

        <div className="space-y-3">
          {yearlyData.map((year) => {
            const scorePercentage = (year.totalScore / maxYearScore) * 100;
            const activityInfo = getActivityLevel(year.totalScore, maxYearScore);
            const isCurrentYear = year.year === new Date().getFullYear();

            return (
              <div key={year.year} className="space-y-2">
                {/* Year Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {year.year}
                    </span>
                    {isCurrentYear && (
                      <span className="text-xs text-gray-700 dark:text-gray-200 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded border dark:border-blue-600/50">
                        Current
                      </span>
                    )}
                    {year.year === mostActiveYear.year && (
                      <span className="text-xs text-gray-700 dark:text-gray-200 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded border dark:border-yellow-600/50">
                        🏆 Peak
                      </span>
                    )}
                    <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border dark:border-gray-600">
                      {activityInfo.level}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
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
                    <Activity size={10} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {year.ecosystems} ecosystem{year.ecosystems !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {year.repos} repositories
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {Math.round(year.totalScore / year.repos)} avg score
                    </span>
                  </div>
                </div>

                {/* Visual Activity Bar */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out bg-primary dark:bg-primary rounded-full"
                    style={{
                      width: `${scorePercentage}%`,
                      minWidth: scorePercentage > 0 ? '8px' : '0px',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Journey Timeline */}
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Development Journey</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Started</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {new Date(firstActivity).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Latest Activity</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {new Date(lastActivity).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Peak Period</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {mostActiveYear.year} ({formatNumber(mostActiveYear.totalScore)})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Status</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                {recentActivity ? "🔥 Active Developer" : "📚 Historical Contributor"}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Patterns */}
        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Contribution Patterns</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Consistency Score
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Based on year-over-year activity
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {yearsActive > 3 ? "High" : yearsActive > 1 ? "Medium" : "Building"}
                </div>
              </div>
            </div>

            <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Growth Trajectory
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Ecosystem expansion over time
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {totalEcosystems > 10 ? "Diverse" : totalEcosystems > 5 ? "Expanding" : "Focused"}
                </div>
              </div>
            </div>

            <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Impact Level
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Peak year contribution intensity
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {mostActiveYear.totalScore > 2000 ? "High Impact" : mostActiveYear.totalScore > 1000 ? "Solid Contributor" : "Steady Builder"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

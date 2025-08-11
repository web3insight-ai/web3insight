import { Card, CardBody, Chip } from "@nextui-org/react";
import { BarChart3, Users, GitBranch, Calendar, TrendingUp, Zap } from "lucide-react";

import type { AIProfile } from "../../typing";

interface StatsDashboardProps {
  aiProfile: AIProfile;
  className?: string;
}

export function StatsDashboard({ aiProfile, className = "" }: StatsDashboardProps) {
  if (!aiProfile.profileCard && !aiProfile.activityTimeline && !aiProfile.web3_involvement) {
    return null;
  }

  const stats = [
    {
      icon: TrendingUp,
      label: "WEB3 SCORE",
      value: aiProfile.web3_involvement?.score || 0,
      max: 100,
      color: "success" as const,
      rawColor: "#22c55e", // green-500
    },
    {
      icon: GitBranch,
      label: "TOTAL SCORE", 
      value: aiProfile.profileCard?.stats?.totalScore || 0,
      max: 400,
      color: "primary" as const,
      rawColor: "#3b82f6", // blue-500
    },
    {
      icon: Users,
      label: "FOLLOWERS",
      value: aiProfile.profileCard?.stats?.followers || 0,
      max: Math.max(aiProfile.profileCard?.stats?.followers || 0, 100),
      color: "warning" as const,
      rawColor: "#f59e0b", // amber-500
    },
    {
      icon: Calendar,
      label: "ACTIVE DAYS",
      value: aiProfile.activityTimeline?.totalDaysActive || 0,
      max: Math.max(aiProfile.activityTimeline?.totalDaysActive || 0, 1000),
      color: "secondary" as const,
      rawColor: "#8b5cf6", // violet-500
    },
    {
      icon: GitBranch,
      label: "REPOSITORIES",
      value: aiProfile.profileCard?.stats?.publicRepos || 0,
      max: Math.max(aiProfile.profileCard?.stats?.publicRepos || 0, 50),
      color: "danger" as const,
      rawColor: "#ef4444", // red-500
    },
    {
      icon: Zap,
      label: "ECOSYSTEMS",
      value: aiProfile.web3Ecosystems?.top3?.length || 0,
      max: 10,
      color: "primary" as const,
      rawColor: "#06b6d4", // cyan-500
    },
  ];

  return (
    <Card className={`bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
          <BarChart3 className="text-primary" size={16} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">KEY METRICS</h3>
          <div className="ml-auto">
            <Chip color="primary" variant="flat" size="sm">
              DASHBOARD
            </Chip>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const percentage = Math.min((stat.value / stat.max) * 100, 100);
            
            return (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <stat.icon size={16} style={{ color: stat.rawColor }} />
                  <Chip color={stat.color} variant="flat" size="sm">
                    <span className="text-xs font-bold">
                      {stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}K` : stat.value}
                    </span>
                  </Chip>
                </div>

                {/* Progress Circle */}
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgb(156, 163, 175)" // gray-400
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke={stat.rawColor}
                      strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Label */}
                <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

"use client";

import React from "react";
import { Users, TrendingUp, Award, Globe } from "lucide-react";

interface EventAnalyticsOverviewProps {
  totalUsers: number;
  usersWithContributions: number;
  usersWithoutContributions: number;
  contributionPercentage: number;
  topEcosystemsCount: number;
  className?: string;
}

const EventAnalyticsOverview: React.FC<EventAnalyticsOverviewProps> = ({
  totalUsers,
  usersWithContributions,
  usersWithoutContributions: _usersWithoutContributions,
  contributionPercentage,
  topEcosystemsCount,
  className = "",
}) => {
  const stats = [
    {
      label: "Total Participants",
      value: totalUsers,
      icon: Users,
      color: "#0D9488", // teal-600
    },
    {
      label: "Active Contributors",
      value: usersWithContributions,
      icon: TrendingUp,
      color: "#047857", // emerald-700
    },
    {
      label: "Contribution Rate",
      value: `${contributionPercentage.toFixed(1)}%`,
      icon: Award,
      color: "#0F766E", // teal-700
    },
    {
      label: "Ecosystems",
      value: topEcosystemsCount,
      icon: Globe,
      color: "#115E59", // teal-800
    },
  ];

  return (
    <div
      className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Award size={14} className="text-fg-muted" />
        <h3 className="text-sm font-medium text-fg">Event Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg font-semibold text-fg mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-fg-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventAnalyticsOverview;

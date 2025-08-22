'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users } from 'lucide-react';

interface ContributionStatsProps {
  usersWithContributions: number;
  usersWithoutContributions: number;
  contributionPercentage: number;
  className?: string;
}

const ContributionStatsChart: React.FC<ContributionStatsProps> = ({
  usersWithContributions,
  usersWithoutContributions,
  contributionPercentage,
  className = "",
}) => {
  const totalUsers = usersWithContributions + usersWithoutContributions;

  const pieData = [
    {
      name: 'With Contributions',
      value: usersWithContributions,
      color: '#0D9488', // teal-600
      percentage: contributionPercentage,
    },
    {
      name: 'Without Contributions',
      value: usersWithoutContributions,
      color: '#e5e7eb', // gray-200
      percentage: 100 - contributionPercentage,
    },
  ];

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Web3 Contribution Analysis</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pie Chart - Left */}
        <div className="lg:col-span-3">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} developers`, ""]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "6px",
                    fontSize: "10px",
                  }}
                  wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-gray-800 dark:[&_.recharts-tooltip-wrapper]:!border-gray-600 dark:[&_.recharts-tooltip-wrapper]:!text-gray-200"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats & Legend - Right */}
        <div className="lg:col-span-2 space-y-2">
          {/* Key Numbers */}
          <div className="text-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalUsers}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Participants</div>
          </div>

          {/* Contribution Breakdown */}
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-600" />
                <span className="text-gray-600 dark:text-gray-400">Contributors</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {usersWithContributions} ({contributionPercentage.toFixed(1)}%)
              </span>
            </div>
            {usersWithoutContributions > 0 && (
              <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-gray-600 dark:text-gray-400">No Contributions</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {usersWithoutContributions} ({(100 - contributionPercentage).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionStatsChart;

"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users } from "lucide-react";

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
      name: "With Contributions",
      value: usersWithContributions,
      color: "var(--accent)",
      percentage: contributionPercentage,
    },
    {
      name: "Without Contributions",
      value: usersWithoutContributions,
      color: "var(--rule)",
      percentage: 100 - contributionPercentage,
    },
  ];

  return (
    <div
      className={`border border-rule rounded-[2px] p-4 bg-bg-raised ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-fg-muted" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] font-medium text-fg-muted">
          web3 contribution analysis
        </h3>
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
                    backgroundColor: "var(--bg-raised)",
                    border: "1px solid var(--rule-strong)",
                    borderRadius: "2px",
                    color: "var(--fg)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-2">
          <div className="text-center p-3 border border-rule rounded-[2px] bg-bg">
            <div className="font-mono text-lg font-semibold text-fg tabular-nums">
              {totalUsers}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
              total participants
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 border border-rule rounded-[2px] text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-accent" />
                <span className="text-fg-muted">With Contributions</span>
              </div>
              <span className="font-mono text-fg tabular-nums">
                {usersWithContributions} ({contributionPercentage.toFixed(1)}%)
              </span>
            </div>
            {usersWithoutContributions > 0 && (
              <div className="flex items-center justify-between p-2 border border-rule rounded-[2px] text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-rule" />
                  <span className="text-fg-muted">Without Contributions</span>
                </div>
                <span className="font-mono text-fg tabular-nums">
                  {usersWithoutContributions} (
                  {(100 - contributionPercentage).toFixed(1)}%)
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

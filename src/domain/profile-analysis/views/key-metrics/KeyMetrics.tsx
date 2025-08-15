
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Globe } from "lucide-react";

import type { GitHubUser } from "../../typing";
import { formatNumber, calculateEcosystemRankings, hasEcosystemData } from "../../helper";

interface KeyMetricsProps {
  user: GitHubUser;
  className?: string;
}

export function KeyMetrics({ user, className = "" }: KeyMetricsProps) {
  if (!hasEcosystemData(user)) {
    return (
      <div className={`glass-card dark:glass-card-dark compact-card text-center ${className}`}>
        <div className="space-y-2">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading metrics...</p>
        </div>
      </div>
    );
  }

  const rankings = calculateEcosystemRankings(user.ecosystem_scores!);
  if (!rankings) return null;

  // Prepare pie chart data from top ecosystems
  const pieData = rankings.slice(0, 5).map((eco, index) => ({
    name: eco.ecosystem.length > 10 ? eco.ecosystem.slice(0, 10) + "..." : eco.ecosystem,
    value: eco.score,
    percentage: eco.percentage,
    color: [
      "#374151", // gray-700
      "#4B5563", // gray-600
      "#6B7280", // gray-500
      "#9CA3AF", // gray-400
      "#D1D5DB", // gray-300
    ][index] || "#9CA3AF",
  }));

  const totalScore = rankings.reduce((sum, eco) => sum + eco.score, 0);

  return (
    <div className={`glass-card dark:glass-card-dark p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} className="text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Web3 生态分析</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pie Chart - Left */}
        <div className="md:col-span-2">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "分数"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats & Legend - Right */}
        <div className="space-y-3">
          {/* Key Numbers */}
          <div className="text-center space-y-2">
            <div>
              <div className="text-xl font-bold text-primary">
                {formatNumber(totalScore)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">总分</div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              覆盖 <strong className="text-gray-900 dark:text-white">{rankings.length}</strong> 个生态
            </div>
          </div>

          {/* Top Ecosystems */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              主要生态:
            </div>
            {pieData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

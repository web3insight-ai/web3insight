'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface EcosystemRankingItem {
  ecosystem: string;
  count: number;
}

interface EcosystemRankingChartProps {
  ecosystemRanking: EcosystemRankingItem[];
  className?: string;
}

const EcosystemRankingChart: React.FC<EcosystemRankingChartProps> = ({
  ecosystemRanking,
  className = "",
}) => {
  // Sort by count in descending order and take top 10
  const sortedData = [...ecosystemRanking]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      color: '#0D9488', // teal-600 consistent
    }));



  // Calculate dynamic height based on number of ecosystems
  const chartDisplayCount = Math.min(sortedData.length, 6);
  const dynamicHeight = Math.min(320, Math.max(160, chartDisplayCount * 40 + 80)); // 40px per item + 80px base
  const chartHeight = dynamicHeight - 60; // Reserve space for margins and labels

  interface TooltipPayload {
    payload: {
      ecosystem: string;
      count: number;
      rank: number;
      color: string;
    };
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              {label}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {data.count} developers
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-gray-600 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ecosystem Rankings</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          Top {Math.min(ecosystemRanking.length, 10)} ecosystems
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2" style={{ minHeight: `${dynamicHeight}px` }}>
        {/* Bar Chart */}
        <div className="flex flex-col justify-end" style={{ height: `${dynamicHeight}px` }}>
          <div className="w-full" style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData.slice(0, chartDisplayCount)}
                margin={{
                  top: 10,
                  right: 10,
                  left: 10,
                  bottom: 45,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-10" />
                <XAxis
                  dataKey="ecosystem"
                  angle={-45}
                  textAnchor="end"
                  height={45}
                  fontSize={9}
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                />
                <YAxis
                  fontSize={9}
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-500 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  fill="#0D9488"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Ecosystems List */}
        <div className="flex flex-col justify-center" style={{ height: `${dynamicHeight}px` }}>
          <div className="space-y-2">
            {sortedData.slice(0, chartDisplayCount).map((item, index) => (
              <div key={item.ecosystem} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {item.ecosystem}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemRankingChart;

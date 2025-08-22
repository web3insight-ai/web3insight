import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Code2 } from "lucide-react";
import { useGitHubStats } from "../../hooks/useGitHubStats";

interface ProgrammingLanguagesPieProps {
  username: string;
  className?: string;
}

// Balanced teal/green theme colors - not too bright, not too dark
const COLORS = [
  "#0d9488", // teal-600 (balanced primary)
  "#059669", // emerald-600
  "#0f766e", // teal-700
  "#047857", // emerald-700
  "#14b8a6", // teal-500
  "#10b981", // emerald-500
];

export function ProgrammingLanguagesPie({ username, className = "" }: ProgrammingLanguagesPieProps) {
  const { data: githubData } = useGitHubStats(username);

  const chartData = githubData?.languages?.slice(0, 6).map(lang => ({
    name: lang.name,
    value: parseFloat(lang.percentage.replace('%', '')),
    percentage: lang.percentage,
  })) || [];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; percentage: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data.payload.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {data.payload.percentage}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Code2 size={14} className="text-gray-600 dark:text-gray-400" />
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Language Distribution</h4>
        {githubData?.languages && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            Top {Math.min(6, githubData.languages.length)}
          </span>
        )}
      </div>

      {githubData?.languages && githubData.languages.length > 0 ? (
        <div className="space-y-4">
          {/* Compact Chart */}
          <div className="h-32 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={56}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="#e5e7eb"
                  strokeWidth={1}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Language List */}
          <div className="space-y-2">
            {chartData.map((lang, index) => (
              <div key={lang.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {lang.name}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {lang.percentage}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Loading skeleton */
        <div className="space-y-4 animate-pulse">
          <div className="h-32 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-8 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgrammingLanguagesPie;

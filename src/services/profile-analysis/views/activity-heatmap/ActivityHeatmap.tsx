import { Card, CardBody, Chip } from "@nextui-org/react";
import { Activity, Calendar, TrendingUp } from "lucide-react";

import type { AIProfile } from "../../typing";

interface ActivityHeatmapProps {
  aiProfile: AIProfile;
  className?: string;
}

export function ActivityHeatmap({ aiProfile, className = "" }: ActivityHeatmapProps) {
  if (!aiProfile.activityTimeline || !aiProfile.web3Ecosystems?.top3) return null;

  const { activityTimeline } = aiProfile;
  const ecosystems = aiProfile.web3Ecosystems.top3;

  // Generate simulated activity data for visualization
  const startYear = new Date(activityTimeline.firstWeb3Activity).getFullYear();
  const endYear = new Date(activityTimeline.lastActivity).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Create activity intensity data
  const activityData = years.map(year => {
    const yearActivity = ecosystems.reduce((acc, eco) => {
      const ecoStartYear = new Date(eco.firstActivityAt).getFullYear();
      const ecoEndYear = new Date(eco.lastActivityAt).getFullYear();
      if (year >= ecoStartYear && year <= ecoEndYear) {
        return acc + eco.score;
      }
      return acc;
    }, 0);

    return {
      year,
      intensity: Math.min(yearActivity / 100, 1), // Normalize to 0-1
      score: yearActivity,
    };
  });

  const maxIntensity = Math.max(...activityData.map(d => d.intensity));

  const getIntensityColor = (intensity: number) => {
    const normalizedIntensity = intensity / maxIntensity;
    if (normalizedIntensity > 0.7) return "bg-success-500 dark:bg-success-400";
    if (normalizedIntensity > 0.4) return "bg-warning-500 dark:bg-warning-400";
    if (normalizedIntensity > 0.1) return "bg-primary-500 dark:bg-primary-400";
    return "bg-gray-300 dark:bg-gray-500";
  };

  return (
    <Card className={`bg-white dark:bg-surface-dark shadow-subtle ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-border dark:border-border-dark">
          <Activity className="text-success" size={16} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ACTIVITY HEATMAP</h3>
          <div className="ml-auto">
            <Chip color="success" variant="flat" size="sm">
              {years.length}Y SPAN
            </Chip>
          </div>
        </div>

        <div className="space-y-4">
          {/* Activity Timeline */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {activityData.map((data) => {
              const intensity = data.intensity / maxIntensity;
              const height = Math.max(intensity * 40, 4); // Min height 4px, max 40px

              return (
                <div key={data.year} className="flex flex-col items-center gap-1 min-w-0 flex-1">
                  {/* Activity Bar */}
                  <div className="w-full max-w-8 flex flex-col justify-end" style={{ height: '50px' }}>
                    <div
                      className={`w-full border border-border dark:border-border-dark transition-all duration-500 ease-out ${getIntensityColor(data.intensity)}`}
                      style={{ height: `${height}px` }}
                    />
                  </div>

                  {/* Year Label */}
                  <span className="text-xs text-gray-600 dark:text-gray-400 transform -rotate-45 origin-center whitespace-nowrap">
                    {data.year}
                  </span>

                  {/* Score */}
                  {data.score > 0 && (
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {data.score}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border dark:border-border-dark">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <Calendar className="mx-auto mb-1 text-primary" size={16} />
              <div className="font-bold text-lg text-primary">{years.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">YEARS</div>
            </div>

            <div className="text-center p-3 bg-success/10 rounded-lg">
              <TrendingUp className="mx-auto mb-1 text-success" size={16} />
              <div className="font-bold text-lg text-success">
                {Math.round(activityTimeline.totalDaysActive / years.length)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">DAYS/YEAR</div>
            </div>

            <div className="text-center p-3 bg-warning/10 rounded-lg">
              <Activity className="mx-auto mb-1 text-warning" size={16} />
              <div className="font-bold text-lg text-warning">
                {activityTimeline.activityLevel.toUpperCase()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">INTENSITY</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-500 border border-gray-300 dark:border-gray-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">LOW</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary-500 border border-primary-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">MED</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning-500 border border-warning-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">HIGH</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success-500 border border-success-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">PEAK</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

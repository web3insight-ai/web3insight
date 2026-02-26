import ClientOnly from "$/ClientOnly";
import ReactECharts from "echarts-for-react";
import { UserCheck } from "lucide-react";
import RepositoryHeaderWidget from "~/repository/widgets/repository-header";

import type { RepositoryDetailProps } from "./typing";

function RepositoryDetail({
  repository,
  activeDevelopers,
}: RepositoryDetailProps) {
  const formatMonthLabel = (value: string) => {
    const [year, month] = value.split("-");
    if (!year || !month) {
      return value;
    }

    const monthIndex = Number.parseInt(month, 10) - 1;
    if (Number.isNaN(monthIndex)) {
      return value;
    }

    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
      }).format(new Date(Date.UTC(Number.parseInt(year, 10), monthIndex, 1)));
    } catch {
      return value;
    }
  };

  const activeDeveloperEntries = activeDevelopers ?? [];
  const activeDeveloperMap = activeDeveloperEntries.reduce<Map<string, number>>(
    (map, entry) => {
      map.set(entry.month, entry.developers);
      return map;
    },
    new Map(),
  );

  const monthKeys: string[] = [];
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const current = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    const key = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
  }

  const activeDeveloperChartValues = monthKeys.map(
    (monthKey) => activeDeveloperMap.get(monthKey) ?? 0,
  );

  const latestActiveDeveloper =
    monthKeys.length > 0
      ? {
        month: monthKeys[monthKeys.length - 1],
        developers:
            activeDeveloperChartValues[activeDeveloperChartValues.length - 1] ??
            0,
      }
      : null;
  const previousActiveDeveloper =
    monthKeys.length > 1
      ? {
        month: monthKeys[monthKeys.length - 2],
        developers:
            activeDeveloperChartValues[activeDeveloperChartValues.length - 2] ??
            0,
      }
      : null;
  const activeDeveloperChange =
    latestActiveDeveloper && previousActiveDeveloper
      ? latestActiveDeveloper.developers - previousActiveDeveloper.developers
      : null;

  const averageActiveDevelopers =
    monthKeys.length > 0
      ? Math.round(
        activeDeveloperChartValues.reduce((sum, value) => sum + value, 0) /
            monthKeys.length,
      )
      : null;

  const peakIndex =
    activeDeveloperChartValues.length > 0
      ? activeDeveloperChartValues.reduce(
        (peak, value, index, array) => (value > array[peak] ? index : peak),
        0,
      )
      : null;

  const peakActiveDeveloper =
    peakIndex !== null && peakIndex !== undefined
      ? {
        month: monthKeys[peakIndex],
        developers: activeDeveloperChartValues[peakIndex],
      }
      : null;

  const activeDeveloperAxisLabels = monthKeys.map(formatMonthLabel);

  const hasActiveDeveloperData = activeDeveloperEntries.length > 0;
  const maxActiveDeveloperValue = Math.max(...activeDeveloperChartValues, 0);
  const computedYAxisMax =
    maxActiveDeveloperValue > 0
      ? Math.max(10, Math.ceil(maxActiveDeveloperValue / 10) * 10)
      : 10;

  return (
    <div className="w-full max-w-content mx-auto px-6 py-8">
      <div className="animate-fade-in">
        <RepositoryHeaderWidget className="mb-4" repository={repository} />
      </div>
      <div className="animate-slide-up mb-4" style={{ animationDelay: "40ms" }}>
        <div className="rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-subtle">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Active Developers
                </h3>
                {latestActiveDeveloper && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMonthLabel(latestActiveDeveloper.month)}
                    {hasActiveDeveloperData && (
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {averageActiveDevelopers !== null && (
                          <span>
                            Avg:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {averageActiveDevelopers}
                            </span>
                          </span>
                        )}
                        {peakActiveDeveloper && (
                          <span className="ml-3">
                            Peak {formatMonthLabel(peakActiveDeveloper.month)}:{" "}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {peakActiveDeveloper.developers}
                            </span>
                          </span>
                        )}
                        <span className="ml-3">
                          Months:{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {monthKeys.length}
                          </span>
                        </span>
                      </span>
                    )}
                    {!hasActiveDeveloperData && (
                      <span className="ml-2">
                        Months: {monthKeys.length} No analytics data.
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            {latestActiveDeveloper && (
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {latestActiveDeveloper.developers}
                </p>
                {previousActiveDeveloper && activeDeveloperChange !== null && (
                  <p
                    className={`text-xs font-medium ${
                      activeDeveloperChange >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {activeDeveloperChange >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(activeDeveloperChange)} vs{" "}
                    {formatMonthLabel(previousActiveDeveloper.month)}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400" />
          <ClientOnly>
            <div className="mt-4 h-[280px]">
              <ReactECharts
                option={{
                  grid: {
                    left: "6%",
                    right: "3%",
                    top: "10%",
                    bottom: "2%",
                    containLabel: true,
                  },
                  tooltip: {
                    trigger: "axis",
                    fontSize: 10,
                  },
                  xAxis: {
                    type: "category",
                    data: activeDeveloperAxisLabels,
                    axisLabel: {
                      interval: 0,
                      rotate: 45,
                      fontSize: 9,
                      color: "#1F2937",
                      margin: 12,
                    },
                    axisTick: { show: false },
                  },
                  yAxis: {
                    type: "value",
                    name: "Developers",
                    nameTextStyle: {
                      fontSize: 9,
                      color: "#1F2937",
                    },
                    axisLabel: {
                      fontSize: 9,
                      color: "#1F2937",
                    },
                    axisTick: { show: false },
                    min: 0,
                    max: computedYAxisMax,
                    boundaryGap: [0, 0.1],
                    splitLine: {
                      lineStyle: {
                        color: "#E5E7EB",
                        opacity: 0.5,
                      },
                    },
                  },
                  series: [
                    {
                      data: activeDeveloperChartValues,
                      type: "bar",
                      itemStyle: {
                        color: "#0D9488",
                      },
                      barWidth: "45%",
                      emphasis: {
                        focus: "series",
                        itemStyle: {
                          color: "#0F766E",
                        },
                      },
                      label: {
                        show: true,
                        position: "top",
                        formatter: ({ value }: { value: number }) =>
                          (value ?? 0).toString(),
                        fontSize: 10,
                        color: "#0F172A",
                      },
                    },
                  ],
                }}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}

export default RepositoryDetail;

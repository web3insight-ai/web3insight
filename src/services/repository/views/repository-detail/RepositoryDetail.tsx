import RepositoryHeaderWidget from "~/repository/widgets/repository-header";
import ClientOnly from "$/ClientOnly";
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, UserPlus, Eye, UserCheck } from 'lucide-react';

import type { RepositoryDetailProps } from "./typing";

function RepositoryDetail({ repository, analysis }: RepositoryDetailProps) {
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
    } catch (error) {
      return value;
    }
  };

  const activeDeveloperEntries = analysis?.activeDevelopers ?? [];
  const activeDeveloperMap = activeDeveloperEntries.reduce<Map<string, number>>((map, entry) => {
    map.set(entry.month, entry.developers);
    return map;
  }, new Map());

  const monthKeys: string[] = [];
  const now = new Date();
  for (let offset = 11; offset >= 0; offset -= 1) {
    const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const key = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, "0")}`;
    monthKeys.push(key);
  }

  const activeDeveloperChartValues = monthKeys.map(
    (monthKey) => activeDeveloperMap.get(monthKey) ?? 0,
  );

  const latestActiveDeveloper = monthKeys.length > 0
    ? {
      month: monthKeys[monthKeys.length - 1],
      developers: activeDeveloperChartValues[activeDeveloperChartValues.length - 1] ?? 0,
    }
    : null;
  const previousActiveDeveloper = monthKeys.length > 1
    ? {
      month: monthKeys[monthKeys.length - 2],
      developers: activeDeveloperChartValues[activeDeveloperChartValues.length - 2] ?? 0,
    }
    : null;
  const activeDeveloperChange = latestActiveDeveloper && previousActiveDeveloper
    ? latestActiveDeveloper.developers - previousActiveDeveloper.developers
    : null;

  const averageActiveDevelopers = monthKeys.length > 0
    ? Math.round(
      activeDeveloperChartValues.reduce((sum, value) => sum + value, 0) /
          monthKeys.length,
    )
    : null;

  const peakIndex = activeDeveloperChartValues.length > 0
    ? activeDeveloperChartValues.reduce((peak, value, index, array) => (
      value > array[peak] ? index : peak
    ), 0)
    : null;

  const peakActiveDeveloper =
    peakIndex !== null && peakIndex !== undefined
      ? {
        month: monthKeys[peakIndex],
        developers: activeDeveloperChartValues[peakIndex],
      }
      : null;

  const activeDeveloperAxisLabels = monthKeys.map(formatMonthLabel);
  const hasActiveDeveloperData = analysis !== null;

  const maxActiveDeveloperValue = Math.max(...activeDeveloperChartValues, 0);
  const computedYAxisMax = maxActiveDeveloperValue > 0
    ? Math.max(10, Math.ceil(maxActiveDeveloperValue / 10) * 10)
    : 10;

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        {/* Repository Header */}
        <div className="animate-fade-in">
          <RepositoryHeaderWidget className="mb-4" repository={repository} />
        </div>

        {/* OpenDigger Metrics */}
        {analysis && (
          <>
            {/* Active Developers Summary */}
            {hasActiveDeveloperData && latestActiveDeveloper && (
              <div className="animate-slide-up mb-4" style={{ animationDelay: "40ms" }}>
                <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Developers</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatMonthLabel(latestActiveDeveloper.month)}
                        </p>
                      </div>
                    </div>
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
                          {Math.abs(activeDeveloperChange)} vs {formatMonthLabel(previousActiveDeveloper.month)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {averageActiveDevelopers !== null && (
                      <span>
                        Avg: <span className="font-medium text-gray-900 dark:text-white">{averageActiveDevelopers}</span>
                      </span>
                    )}
                    {peakActiveDeveloper && (
                      <span>
                        Peak {formatMonthLabel(peakActiveDeveloper.month)}: {" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {peakActiveDeveloper.developers}
                        </span>
                      </span>
                    )}
                    <span>
                      Months: <span className="font-medium text-gray-900 dark:text-white">{monthKeys.length}</span>
                    </span>
                  </div>
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
                            trigger: 'axis',
                            fontSize: 10,
                          },
                          xAxis: {
                            type: 'category',
                            data: activeDeveloperAxisLabels,
                            axisLabel: {
                              interval: 0,
                              rotate: 45,
                              fontSize: 9,
                              color: '#1F2937',
                              margin: 12,
                            },
                            axisTick: { show: false },
                          },
                          yAxis: {
                            type: 'value',
                            name: 'Developers',
                            nameTextStyle: {
                              fontSize: 9,
                              color: '#1F2937',
                            },
                            axisLabel: {
                              fontSize: 9,
                              color: '#1F2937',
                            },
                            axisTick: { show: false },
                            min: 0,
                            max: computedYAxisMax,
                            boundaryGap: [0, 0.1],
                            splitLine: {
                              lineStyle: {
                                color: '#E5E7EB',
                                opacity: 0.5,
                              },
                            },
                          },
                          series: [{
                            data: activeDeveloperChartValues,
                            type: 'bar',
                            itemStyle: {
                              color: '#0EA5E9',
                            },
                            barWidth: '45%',
                            emphasis: {
                              focus: 'series',
                              itemStyle: {
                                color: '#0284C7',
                              },
                            },
                            label: {
                              show: true,
                              position: 'top',
                              formatter: ({ value }: { value: number }) => (value ?? 0).toString(),
                              fontSize: 10,
                              color: '#0F172A',
                            },
                          }],
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  </ClientOnly>
                </div>
              </div>
            )}

            {/* OpenRank Chart */}
            {analysis.openrank && Object.keys(analysis.openrank).length > 0 && (
              <div className="animate-slide-up mb-4" style={{ animationDelay: "100ms" }}>
                <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">OpenRank Trend</h3>
                  </div>
                  <ClientOnly>
                    <div className="h-48">
                      <ReactECharts
                        option={{
                          grid: {
                            left: "8%",
                            right: "4%",
                            top: "5%",
                            bottom: "15%",
                          },
                          tooltip: {
                            trigger: 'axis',
                            fontSize: 10,
                            formatter: function(params: unknown) {
                              const point = (params as Array<{ name: string; value: number }>)[0];
                              return `${point.name}<br/>OpenRank: ${point.value.toFixed(2)}`;
                            },
                          },
                          xAxis: {
                            type: 'category',
                            data: Object.keys(analysis.openrank),
                            axisLabel: {
                              rotate: 45,
                              fontSize: 9,
                              color: '#6B7280',
                              formatter: function(value: string) {
                                return value.slice(0, 7); // Show YYYY-MM
                              },
                            },
                            axisTick: { show: false },
                          },
                          yAxis: {
                            type: 'value',
                            name: 'OpenRank',
                            nameTextStyle: {
                              fontSize: 9,
                              color: '#6B7280',
                            },
                            axisLabel: {
                              fontSize: 9,
                              color: '#6B7280',
                            },
                            axisTick: { show: false },
                            splitLine: {
                              lineStyle: {
                                color: '#E5E7EB',
                                opacity: 0.5,
                              },
                            },
                          },
                          series: [{
                            data: Object.values(analysis.openrank),
                            type: 'line',
                            smooth: true,
                            lineStyle: {
                              width: 2,
                              color: '#0D9488',
                            },
                            areaStyle: {
                              color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                  offset: 0, color: 'rgba(13, 148, 136, 0.2)',
                                }, {
                                  offset: 1, color: 'rgba(13, 148, 136, 0.02)',
                                }],
                              },
                            },
                            itemStyle: {
                              color: '#0D9488',
                            },
                          }],
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  </ClientOnly>
                </div>
              </div>
            )}

            {/* Activity Metrics */}
            <div className="animate-slide-up space-y-4" style={{ animationDelay: "300ms" }}>
              {/* Participants and New Contributors in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Participants */}
                {analysis.participants && Object.keys(analysis.participants).length > 0 && (
                  <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={14} className="text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Active Participants</h3>
                    </div>
                    <ClientOnly>
                      <div className="h-48">
                        <ReactECharts
                          option={{
                            grid: {
                              left: "8%",
                              right: "4%",
                              top: "5%",
                              bottom: "15%",
                            },
                            tooltip: {
                              trigger: 'axis',
                              fontSize: 10,
                            },
                            xAxis: {
                              type: 'category',
                              data: Object.keys(analysis.participants).slice(-12),
                              axisLabel: {
                                rotate: 45,
                                fontSize: 9,
                                color: '#6B7280',
                                formatter: function(value: string) {
                                  return value.slice(0, 7);
                                },
                              },
                              axisTick: { show: false },
                            },
                            yAxis: {
                              type: 'value',
                              name: 'Count',
                              nameTextStyle: {
                                fontSize: 9,
                                color: '#6B7280',
                              },
                              axisLabel: {
                                fontSize: 9,
                                color: '#6B7280',
                              },
                              axisTick: { show: false },
                              splitLine: {
                                lineStyle: {
                                  color: '#E5E7EB',
                                  opacity: 0.5,
                                },
                              },
                            },
                            series: [{
                              data: Object.values(analysis.participants).slice(-12),
                              type: 'bar',
                              itemStyle: {
                                color: '#0D9488',
                              },
                              barWidth: '60%',
                            }],
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </ClientOnly>
                  </div>
                )}

                {/* New Contributors */}
                {analysis.newContributors && Object.keys(analysis.newContributors).length > 0 && (
                  <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus size={14} className="text-gray-600 dark:text-gray-400" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">New Contributors</h3>
                    </div>
                    <ClientOnly>
                      <div className="h-48">
                        <ReactECharts
                          option={{
                            grid: {
                              left: "8%",
                              right: "4%",
                              top: "5%",
                              bottom: "15%",
                            },
                            tooltip: {
                              trigger: 'axis',
                              fontSize: 10,
                            },
                            xAxis: {
                              type: 'category',
                              data: Object.keys(analysis.newContributors).slice(-12),
                              axisLabel: {
                                rotate: 45,
                                fontSize: 9,
                                color: '#6B7280',
                                formatter: function(value: string) {
                                  return value.slice(0, 7);
                                },
                              },
                              axisTick: { show: false },
                            },
                            yAxis: {
                              type: 'value',
                              name: 'Count',
                              nameTextStyle: {
                                fontSize: 9,
                                color: '#6B7280',
                              },
                              axisLabel: {
                                fontSize: 9,
                                color: '#6B7280',
                              },
                              axisTick: { show: false },
                              splitLine: {
                                lineStyle: {
                                  color: '#E5E7EB',
                                  opacity: 0.5,
                                },
                              },
                            },
                            series: [{
                              data: Object.values(analysis.newContributors).slice(-12),
                              type: 'bar',
                              itemStyle: {
                                color: '#8B5CF6',
                              },
                              barWidth: '60%',
                            }],
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </ClientOnly>
                  </div>
                )}
              </div>

              {/* Attention - Full Width */}
              {analysis.attention && Object.keys(analysis.attention).length > 0 && (
                <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Repository Attention</h3>
                  </div>
                  <ClientOnly>
                    <div className="h-48">
                      <ReactECharts
                        option={{
                          grid: {
                            left: "8%",
                            right: "4%",
                            top: "5%",
                            bottom: "15%",
                          },
                          tooltip: {
                            trigger: 'axis',
                            fontSize: 10,
                          },
                          xAxis: {
                            type: 'category',
                            data: Object.keys(analysis.attention).slice(-12),
                            axisLabel: {
                              rotate: 45,
                              fontSize: 9,
                              color: '#6B7280',
                              formatter: function(value: string) {
                                return value.slice(0, 7);
                              },
                            },
                            axisTick: { show: false },
                          },
                          yAxis: {
                            type: 'value',
                            name: 'Attention',
                            nameTextStyle: {
                              fontSize: 9,
                              color: '#6B7280',
                            },
                            axisLabel: {
                              fontSize: 9,
                              color: '#6B7280',
                            },
                            axisTick: { show: false },
                            splitLine: {
                              lineStyle: {
                                color: '#E5E7EB',
                                opacity: 0.5,
                              },
                            },
                          },
                          series: [{
                            data: Object.values(analysis.attention).slice(-12),
                            type: 'line',
                            smooth: true,
                            lineStyle: {
                              width: 2,
                              color: '#F59E0B',
                            },
                            areaStyle: {
                              color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                  offset: 0, color: 'rgba(245, 158, 11, 0.2)',
                                }, {
                                  offset: 1, color: 'rgba(245, 158, 11, 0.02)',
                                }],
                              },
                            },
                            itemStyle: {
                              color: '#F59E0B',
                            },
                          }],
                        }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  </ClientOnly>
                </div>
              )}
            </div>

            {/* Show message if no OpenDigger data is available */}
            {(!analysis.openrank || Object.keys(analysis.openrank).length === 0) &&
             (!analysis.participants || Object.keys(analysis.participants).length === 0) &&
             (!analysis.newContributors || Object.keys(analysis.newContributors).length === 0) &&
             (!analysis.attention || Object.keys(analysis.attention).length === 0) && (
              <div />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RepositoryDetail;

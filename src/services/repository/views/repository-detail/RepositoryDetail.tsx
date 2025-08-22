import RepositoryHeaderWidget from "~/repository/widgets/repository-header";
import ClientOnly from "$/ClientOnly";
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Users, UserPlus, Eye } from 'lucide-react';

import type { RepositoryDetailProps } from "./typing";

function RepositoryDetail({ repository, analysis }: RepositoryDetailProps) {
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
              <div className="animate-slide-up mb-4" style={{ animationDelay: "100ms" }}>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    OpenDigger metrics are currently unavailable for this repository.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RepositoryDetail;

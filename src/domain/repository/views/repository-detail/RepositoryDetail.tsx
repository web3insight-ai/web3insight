import ChartCard from "$/control/chart-card";

import RepositoryHeaderWidget from "~/repository/widgets/repository-header";
import ClientOnly from "$/ClientOnly";

import type { RepositoryDetailProps } from "./typing";

function RepositoryDetail({ repository, analysis }: RepositoryDetailProps) {
  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
      <div className="w-full max-w-content mx-auto px-6">
        {/* Repository Header */}
        <div className="animate-fade-in">
          <RepositoryHeaderWidget className="mb-8" repository={repository} />
        </div>

        {/* OpenDigger Metrics */}
        {analysis && (
          <>
            {/* OpenRank Chart */}
            {analysis.openrank && Object.keys(analysis.openrank).length > 0 && (
              <div className="animate-slide-up mb-8" style={{ animationDelay: "100ms" }}>
                <ClientOnly>
                  <ChartCard
                    title="OpenRank Trend"
                    style={{ height: "320px" }}
                    option={{
                      tooltip: {
                        trigger: 'axis',
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
                          formatter: function(value: string) {
                            return value.slice(0, 7); // Show YYYY-MM
                          },
                        },
                      },
                      yAxis: {
                        type: 'value',
                        name: 'OpenRank',
                      },
                      series: [{
                        data: Object.values(analysis.openrank),
                        type: 'line',
                        smooth: true,
                        lineStyle: {
                          width: 3,
                          color: '#0066FF',
                        },
                        areaStyle: {
                          color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                              offset: 0, color: 'rgba(0, 102, 255, 0.2)',
                            }, {
                              offset: 1, color: 'rgba(0, 102, 255, 0.02)',
                            }],
                          },
                        },
                      }],
                    }}
                  />
                </ClientOnly>
              </div>
            )}

            {/* Activity Metrics */}
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              {/* Participants and New Contributors in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Participants */}
                {analysis.participants && Object.keys(analysis.participants).length > 0 && (
                  <ClientOnly>
                    <ChartCard
                      title="Active Participants"
                      style={{ height: "280px" }}
                      option={{
                        tooltip: {
                          trigger: 'axis',
                        },
                        xAxis: {
                          type: 'category',
                          data: Object.keys(analysis.participants).slice(-12),
                          axisLabel: {
                            rotate: 45,
                            formatter: function(value: string) {
                              return value.slice(0, 7);
                            },
                          },
                        },
                        yAxis: {
                          type: 'value',
                          name: 'Count',
                        },
                        series: [{
                          data: Object.values(analysis.participants).slice(-12),
                          type: 'bar',
                          itemStyle: {
                            color: '#10B981',
                          },
                        }],
                      }}
                    />
                  </ClientOnly>
                )}

                {/* New Contributors */}
                {analysis.newContributors && Object.keys(analysis.newContributors).length > 0 && (
                  <ClientOnly>
                    <ChartCard
                      title="New Contributors"
                      style={{ height: "280px" }}
                      option={{
                        tooltip: {
                          trigger: 'axis',
                        },
                        xAxis: {
                          type: 'category',
                          data: Object.keys(analysis.newContributors).slice(-12),
                          axisLabel: {
                            rotate: 45,
                            formatter: function(value: string) {
                              return value.slice(0, 7);
                            },
                          },
                        },
                        yAxis: {
                          type: 'value',
                          name: 'Count',
                        },
                        series: [{
                          data: Object.values(analysis.newContributors).slice(-12),
                          type: 'bar',
                          itemStyle: {
                            color: '#8B5CF6',
                          },
                        }],
                      }}
                    />
                  </ClientOnly>
                )}
              </div>

              {/* Attention - Full Width */}
              {analysis.attention && Object.keys(analysis.attention).length > 0 && (
                <ClientOnly>
                  <ChartCard
                    title="Repository Attention"
                    style={{ height: "280px" }}
                    option={{
                      tooltip: {
                        trigger: 'axis',
                      },
                      xAxis: {
                        type: 'category',
                        data: Object.keys(analysis.attention).slice(-12),
                        axisLabel: {
                          rotate: 45,
                          formatter: function(value: string) {
                            return value.slice(0, 7);
                          },
                        },
                      },
                      yAxis: {
                        type: 'value',
                        name: 'Attention',
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
                      }],
                    }}
                  />
                </ClientOnly>
              )}
            </div>

            {/* Show message if no OpenDigger data is available */}
            {(!analysis.openrank || Object.keys(analysis.openrank).length === 0) &&
             (!analysis.participants || Object.keys(analysis.participants).length === 0) &&
             (!analysis.newContributors || Object.keys(analysis.newContributors).length === 0) &&
             (!analysis.attention || Object.keys(analysis.attention).length === 0) && (
              <div className="animate-slide-up mb-8" style={{ animationDelay: "100ms" }}>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 p-6 text-center">
                  <p className="text-yellow-800 dark:text-yellow-200">
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

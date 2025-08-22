'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, Avatar, Button } from "@nextui-org/react";
import { Calendar, Users, Trophy, Medal, Award, ChevronDown, ChevronUp, Edit3 } from "lucide-react";

import ReactECharts from "echarts-for-react";

import ProfileCardWidget from "../../../developer/widgets/profile-card";
import { ProgrammingLanguagesBar } from "../../../../components/event/ProgrammingLanguagesBar";
import { ProgrammingLanguagesPie } from "../../../../components/event/ProgrammingLanguagesPie";
import ContributionStatsChart from "../../../../components/ContributionStatsChart";
import EcosystemRankingChart from "../../../../components/EcosystemRankingChart";
import EventAnalyticsOverview from "../../../../components/EventAnalyticsOverview";
import EventAnalyticsSkeleton from "../../../../components/loading/EventAnalyticsSkeleton";

import type { EventReport } from "../../typing";
import { fetchOne } from "../../repository/client";

import type { EventDetailViewWidgetProps } from "./typing";
import { resolveChartOptions } from "./helper";
import RepoScoreListCard from "./RepoScoreListCard";
import EventEditDialog from "./EventEditDialog";

interface EventAnalysisData {
  ecosystem_ranking: Array<{ ecosystem: string; count: number }>;
  contribution_percentage: number;
  users_with_contributions: number;
  users_without_contributions: number;
}

function EventDetailView({ id }: EventDetailViewWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [contestants, setContestants] = useState<EventReport["contestants"]>([]);
  const [expandedContestants, setExpandedContestants] = useState<Set<string>>(new Set());
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventData, setEventData] = useState<EventReport | null>(null);
  const [loadingEventData, setLoadingEventData] = useState(false);
  const [analysisData, setAnalysisData] = useState<EventAnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const formatDisplayName = (contestant: typeof contestants[0]) => {
    if (!contestant.nickname || contestant.nickname === contestant.username) {
      return contestant.username || "Unknown User";
    }
    return (
      <>
        {contestant.nickname}{" "}
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
          ({contestant.username})
        </span>
      </>
    );
  };

  useEffect(() => {
    setLoading(true);

    // Fetch event analysis data
    const fetchAnalysisData = async () => {
      setLoadingAnalysis(true);
      try {
        const response = await fetch(`/api/analysis/events/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setAnalysisData({
              ecosystem_ranking: result.data.ecosystem_ranking || [],
              contribution_percentage: result.data.contribution_percentage || 0,
              users_with_contributions: result.data.users_with_contributions || 0,
              users_without_contributions: result.data.users_without_contributions || 0,
            });
          }
        }
      } catch (error) {
        console.error('[Event Detail] Error fetching analysis data:', error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    const loadEventData = async () => {
      try {
        // Fetch both event data and analysis data
        await Promise.all([
          fetchOne(id).then(res => {
            if (res.success) {
              setContestants(res.data.contestants);
            } else {
              console.error(`[Event Detail] Failed to fetch event data:`, res.message);
              alert(res.message);
            }
          }),
          fetchAnalysisData(),
        ]);
      } catch (error) {
        console.error(`[Event Detail] Error fetching event data:`, error);
        alert("Failed to load event data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id]);

  // Fetch event data for editing
  const fetchEventData = async () => {
    setLoadingEventData(true);
    try {
      const result = await fetchOne(id);
      if (result.success) {
        setEventData(result.data);
      }
    } catch (error) {
      console.error('[EventDetailView] Error fetching event data:', error);
    } finally {
      setLoadingEventData(false);
    }
  };

  const handleEditClick = () => {
    if (!eventData) {
      fetchEventData();
    }
    setShowEditDialog(true);
  };

  const handleEditSuccess = () => {
    // Refresh the page to show updated data
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (contestants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contestants found</h3>
          <p className="text-gray-500 dark:text-gray-400">This event doesn&apos;t have any contestants yet.</p>
        </div>
      </div>
    );
  }

  const toggleContestant = (contestantId: string) => {
    const newExpanded = new Set(expandedContestants);
    if (newExpanded.has(contestantId)) {
      newExpanded.delete(contestantId);
    } else {
      newExpanded.add(contestantId);
    }
    setExpandedContestants(newExpanded);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
    case 0:
      return <Trophy size={16} className="text-yellow-600 dark:text-yellow-400" />;
    case 1:
      return <Medal size={16} className="text-gray-500 dark:text-gray-400" />;
    case 2:
      return <Award size={16} className="text-orange-600 dark:text-orange-400" />;
    default:
      return <span className="text-xs font-semibold">{index + 1}</span>;
    }
  };

  const getRankBadgeStyles = (index: number) => {
    switch (index) {
    case 0:
      return "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700";
    case 1:
      return "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-surface-elevated dark:to-surface-dark text-gray-700 dark:text-gray-400 border-gray-300 dark:border-border-dark";
    case 2:
      return "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-500/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30";
    default:
      return "bg-gray-50 dark:bg-surface-dark text-gray-600 dark:text-gray-500 border-gray-200 dark:border-border-dark";
    }
  };

  return (
    <div className="space-y-4">
      {/* Event Overview */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Overview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contestants.length} contestants participating</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="light"
                startContent={<Edit3 size={14} />}
                onClick={handleEditClick}
                isLoading={loadingEventData}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 h-8 min-w-0"
              >
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Web3 Analytics Section */}
      {analysisData ? (
        <div className="space-y-4">
          {/* Analytics Overview */}
          <EventAnalyticsOverview
            totalUsers={analysisData.users_with_contributions + analysisData.users_without_contributions}
            usersWithContributions={analysisData.users_with_contributions}
            usersWithoutContributions={analysisData.users_without_contributions}
            contributionPercentage={analysisData.contribution_percentage}
            topEcosystemsCount={analysisData.ecosystem_ranking.length}
          />

          {/* Contribution Statistics */}
          <ContributionStatsChart
            usersWithContributions={analysisData.users_with_contributions}
            usersWithoutContributions={analysisData.users_without_contributions}
            contributionPercentage={analysisData.contribution_percentage}
          />

          {/* Ecosystem Ranking */}
          {analysisData.ecosystem_ranking.length > 0 && (
            <EcosystemRankingChart
              ecosystemRanking={analysisData.ecosystem_ranking}
            />
          )}
        </div>
      ) : loadingAnalysis ? (
        <EventAnalyticsSkeleton />
      ) : null}

      {/* Participants List */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Users size={18} className="text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Participants</h3>
          </div>
        </CardHeader>

        <div className="divide-y divide-border dark:divide-border-dark">
          {contestants.map((contestant, index) => {
            const isExpanded = expandedContestants.has(String(contestant.id));

            return (
              <div key={contestant.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Participant Row */}
                <button
                  className="w-full px-6 py-4 text-left hover:bg-surface dark:hover:bg-surface-dark transition-colors duration-200 focus:outline-none focus:bg-surface dark:focus:bg-surface-dark"
                  onClick={() => toggleContestant(String(contestant.id))}
                  aria-expanded={isExpanded}
                  aria-controls={`contestant-details-${String(contestant.id)}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium ${getRankBadgeStyles(index)}`}>
                      {getRankIcon(index)}
                    </div>

                    {/* Avatar */}
                    <Avatar
                      src={contestant.avatar}
                      fallback={contestant.username || "?"}
                      size="md"
                      className="border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0"
                    />

                    {/* Participant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatDisplayName(contestant)}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Rank #{index + 1} • {contestant.analytics.length} ecosystems
                          </p>
                        </div>

                        {/* Top Ecosystem Scores - Horizontal Display */}
                        <div className="flex items-center gap-2 ml-2">
                          <div className="hidden lg:flex items-center gap-1.5 max-w-2xl overflow-hidden">
                            {contestant.analytics.slice(0, 3).map((eco, ecoIndex) => (
                              <div
                                key={`${eco.name}-${ecoIndex}`}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-md flex-shrink-0"
                                title={`${eco.name}: ${eco.score}`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                  {eco.name}
                                </span>
                                <span className="text-xs font-semibold text-primary flex-shrink-0">
                                  {eco.score}
                                </span>
                              </div>
                            ))}
                            {contestant.analytics.length > 3 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                +{contestant.analytics.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Medium screens: Show abbreviated names */}
                          <div className="hidden sm:flex lg:hidden items-center gap-1.5 max-w-lg overflow-hidden">
                            {contestant.analytics.slice(0, 3).map((eco, ecoIndex) => {
                              // Smart abbreviation for medium screens
                              const abbrevName = eco.name.length > 8
                                ? eco.name.split(' ').map(word => word.slice(0, 3)).join(' ')
                                : eco.name;

                              return (
                                <div
                                  key={`${eco.name}-${ecoIndex}`}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-md flex-shrink-0"
                                  title={`${eco.name}: ${eco.score}`}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {abbrevName}
                                  </span>
                                  <span className="text-xs font-semibold text-primary flex-shrink-0">
                                    {eco.score}
                                  </span>
                                </div>
                              );
                            })}
                            {contestant.analytics.length > 3 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                +{contestant.analytics.length - 3}
                              </span>
                            )}
                          </div>

                          {/* Mobile: Show only count */}
                          <div className="sm:hidden">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {contestant.analytics.length} ecosystems
                            </span>
                          </div>

                          {/* Expand/Collapse Icon */}
                          <div className="flex items-center text-gray-400 dark:text-gray-500">
                            {isExpanded ? (
                              <ChevronUp size={18} className="transition-transform duration-200" />
                            ) : (
                              <ChevronDown size={18} className="transition-transform duration-200" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    id={`contestant-details-${String(contestant.id)}`}
                    className="px-6 pb-4 bg-gray-50 dark:bg-surface-elevated"
                  >
                    <div className="space-y-4 pt-3">
                      {/* Profile Section - Full Width */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Developer Profile
                        </h5>
                        <ProfileCardWidget developer={contestant} />
                      </div>

                      {/* Programming Languages Section - Two Column Layout */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Programming Languages
                        </h5>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <ProgrammingLanguagesBar username={contestant.username} />
                          <ProgrammingLanguagesPie username={contestant.username} />
                        </div>
                      </div>

                      {/* Ecosystem Scores Chart - Full Width */}
                      <div>
                        <div className="border border-border dark:border-border-dark rounded-xl p-4 bg-white dark:bg-surface-dark shadow-subtle">
                          <div className="flex items-center gap-2 mb-3">
                            <Trophy size={14} className="text-gray-600 dark:text-gray-400" />
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Ecosystem Scores</h3>
                          </div>
                          <div className="h-40">
                            <ReactECharts
                              option={resolveChartOptions(contestant.analytics)}
                              style={{ height: '100%', width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Repository Scores Section - Full Width */}
                      <div>
                        <RepoScoreListCard dataSource={contestant.analytics} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edit Dialog */}
      <EventEditDialog
        visible={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSuccess={handleEditSuccess}
        event={eventData}
      />
    </div>
  );
}

export default EventDetailView;

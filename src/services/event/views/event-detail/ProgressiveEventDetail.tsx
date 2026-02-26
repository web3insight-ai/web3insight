"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, Avatar, Chip, Button } from "@/components/ui";
import {
  Users,
  Trophy,
  Medal,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Edit3,
} from "lucide-react";

import AnalysisProgress from "$/loading/AnalysisProgress";
import AnalysisSkeleton from "$/loading/AnalysisSkeleton";

import type { PartialContestant, EventReport } from "../../typing";
import {
  createPartialContestants,
  isAnalysisComplete,
  calculateOverallProgress,
} from "../../helper/progressive";
import { fetchOne } from "../../repository/client";

import type { EventDetailViewWidgetProps } from "./typing";
import EventEditDialog from "./EventEditDialog";

function ProgressiveEventDetail({ id }: EventDetailViewWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [contestants, setContestants] = useState<PartialContestant[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedContestants, setExpandedContestants] = useState<Set<string>>(
    new Set(),
  );
  const [overallProgress, setOverallProgress] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [eventData, setEventData] = useState<EventReport | null>(null);
  const [loadingEventData, setLoadingEventData] = useState(false);

  // Poll for real analysis updates from the server
  const pollAnalysisUpdates = useCallback(async () => {
    if (analysisComplete) return;

    try {
      const result = await fetchOne(id);
      if (result.success && result.data.contestants) {
        const updatedContestants = createPartialContestants(
          result.data.contestants,
        );
        setContestants(updatedContestants);

        const newOverallProgress = calculateOverallProgress(updatedContestants);
        setOverallProgress(newOverallProgress);

        if (isAnalysisComplete(updatedContestants)) {
          setAnalysisComplete(true);
          setPollingActive(false);
        }
      }
    } catch (error) {
      console.error(
        "[Progressive Event Detail] Error polling analysis updates:",
        error,
      );
    }
  }, [analysisComplete, id]);

  // Fetch event data for editing
  const fetchEventData = async () => {
    setLoadingEventData(true);
    try {
      const result = await fetchOne(id);
      if (result.success) {
        setEventData(result.data);
      }
    } catch (error) {
      console.error(
        "[ProgressiveEventDetail] Error fetching event data:",
        error,
      );
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

  // Initial fetch - get event data and show contestants immediately
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const result = await fetchOne(id);
        if (result.success && result.data.contestants) {
          // Convert real contestants to partial contestants for progressive display
          const partialContestants = createPartialContestants(
            result.data.contestants,
          );
          setContestants(partialContestants);
          setOverallProgress(calculateOverallProgress(partialContestants));
          setPollingActive(true);
        } else {
          console.error(
            `[Progressive Event Detail] Failed to fetch event data:`,
            result.message,
          );
        }
        setLoading(false);
      } catch (error) {
        console.error(
          `[Progressive Event Detail] Error fetching event data:`,
          error,
        );
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Polling for analysis updates
  useEffect(() => {
    if (!pollingActive || analysisComplete) return;

    const interval = setInterval(pollAnalysisUpdates, 10000); // Update every 10 seconds (same as original)

    return () => clearInterval(interval);
  }, [pollingActive, analysisComplete, pollAnalysisUpdates]);

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
      return (
        <Trophy size={16} className="text-yellow-600 dark:text-yellow-400" />
      );
    case 1:
      return <Medal size={16} className="text-gray-500 dark:text-gray-400" />;
    case 2:
      return (
        <Award size={16} className="text-orange-600 dark:text-orange-400" />
      );
    default:
      return <span className="text-xs font-semibold">{index + 1}</span>;
    }
  };

  if (loading) {
    return <AnalysisSkeleton userCount={2} />;
  }

  return (
    <div className="space-y-8">
      {/* Event Overview with Analysis Progress */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Event Analysis
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {contestants.length} contestants •{" "}
                  {analysisComplete
                    ? "Analysis complete"
                    : "Analysis in progress"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              {!analysisComplete && (
                <AnalysisProgress
                  status="analyzing"
                  progress={overallProgress}
                  message={`${contestants.filter((c) => c.analysisStatus === "completed").length}/${contestants.length} completed`}
                />
              )}

              {analysisComplete && (
                <Chip color="success" variant="flat">
                  ✓ Complete
                </Chip>
              )}

              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Edit3 size={16} />}
                onClick={handleEditClick}
                isLoading={loadingEventData}
                className="text-sm font-medium px-4 h-9"
              >
                Edit Event
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Participants List with Progressive Loading */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border dark:border-border-dark">
          <div className="flex items-center justify-between w-full">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Contestants
            </h4>
            {pollingActive && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <RefreshCw size={14} className="animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </CardHeader>

        <div className="divide-y divide-border dark:divide-border-dark">
          {contestants.map((contestant, index) => {
            const isExpanded = expandedContestants.has(
              contestant.id.toString(),
            );

            return (
              <div key={contestant.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border ${contestant.analysisStatus === "completed" ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700" : "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-500 border-gray-200 dark:border-gray-800"}`}
                  >
                    {getRankIcon(index)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={contestant.avatar_url} size="md" />
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {contestant.name || contestant.login}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            @{contestant.login}
                          </p>
                          {contestant.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {contestant.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="light"
                        size="sm"
                        onClick={() =>
                          toggleContestant(contestant.id.toString())
                        }
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </Button>
                    </div>

                    {/* Analysis Status */}
                    <div className="mb-4">
                      <AnalysisProgress
                        status={contestant.analysisStatus}
                        progress={contestant.analysisProgress}
                        estimatedTime={contestant.estimatedTime}
                      />
                    </div>

                    {/* Expanded Analysis Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
                        {contestant.analysisStatus === "completed" &&
                        contestant.analytics ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {contestant.analytics.map((analytics) => (
                                <div
                                  key={analytics.name}
                                  className="p-4 border border-border dark:border-border-dark rounded-lg"
                                >
                                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {analytics.name}
                                  </h6>
                                  <div className="text-2xl font-bold text-primary mb-2">
                                    {analytics.score || 0}
                                  </div>
                                  {analytics.repos && (
                                    <div className="space-y-1">
                                      {analytics.repos.slice(0, 3).map((repo) => (
                                        <div
                                          key={repo.fullName}
                                          className="flex justify-between text-sm"
                                        >
                                          <span className="text-gray-600 dark:text-gray-400 truncate">
                                            {repo.fullName}
                                          </span>
                                          <span className="text-gray-500 dark:text-gray-500 ml-2">
                                            {repo.score}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <AnalysisSkeleton
                              showUserInfo={false}
                              showEcosystemCards
                              userCount={1}
                            />
                          )}
                      </div>
                    )}
                  </div>
                </div>
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

export default ProgressiveEventDetail;

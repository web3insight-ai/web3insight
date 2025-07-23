import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, Avatar, Badge, Button } from "@nextui-org/react";
import { Users, Trophy, Medal, Award, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

import AnalysisProgress from "@/components/loading/AnalysisProgress";
import AnalysisSkeleton from "@/components/loading/AnalysisSkeleton";

import type { PartialContestant } from "../../typing";
import { 
  createPartialContestants, 
  isAnalysisComplete,
  calculateOverallProgress, 
} from "../../helper/progressive";

import type { EventDetailViewWidgetProps } from "./typing";

function ProgressiveEventDetail({ id }: EventDetailViewWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [contestants, setContestants] = useState<PartialContestant[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedContestants, setExpandedContestants] = useState<Set<string>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);

  // Simulate progressive analysis updates
  const simulateProgressUpdates = useCallback(() => {
    if (analysisComplete) return;

    setContestants(prevContestants => {
      const updatedContestants = prevContestants.map(contestant => {
        if (contestant.analysisStatus === "analyzing") {
          const newProgress = Math.min((contestant.analysisProgress || 10) + Math.random() * 15, 95);
          
          if (newProgress > 90 && Math.random() > 0.5) {
            // Complete this contestant's analysis
            return {
              ...contestant,
              analysisStatus: "completed" as const,
              analysisProgress: 100,
              analytics: contestant.analytics?.map(analytics => ({
                ...analytics,
                status: "completed" as const,
                progress: 100,
                score: Math.floor(Math.random() * 900) + 100, // Random score
                repos: [
                  { fullName: "example/repo1", score: "250" },
                  { fullName: "example/repo2", score: "180" },
                  { fullName: "example/repo3", score: "95" },
                ],
              })),
            };
          }

          return {
            ...contestant,
            analysisProgress: newProgress,
          };
        }
        return contestant;
      });

      const newOverallProgress = calculateOverallProgress(updatedContestants);
      setOverallProgress(newOverallProgress);

      if (isAnalysisComplete(updatedContestants)) {
        setAnalysisComplete(true);
        setPollingActive(false);
      }

      return updatedContestants;
    });
  }, [analysisComplete]);

  // Initial fetch - get basic GitHub user data immediately
  useEffect(() => {
    const fetchBasicData = async () => {
      try {
        // This would typically be a modified insertOne response
        // For now, we'll simulate getting basic GitHub user data
        const mockGithubUsers = [
          {
            id: 1,
            login: "johndev",
            name: "John Developer",
            bio: "Full-stack developer passionate about Web3",
            avatar_url: "https://github.com/identicons/johndev.png",
            location: "San Francisco, CA",
            public_repos: 25,
            html_url: "https://github.com/johndev",
            email: "",
            company: "",
            blog: "",
            twitter_username: "",
            created_at: "2019-03-15T10:00:00Z",
          },
          {
            id: 2,
            login: "aliceblockchain",
            name: "Alice Blockchain",
            bio: "Smart contract developer and DeFi enthusiast",
            avatar_url: "https://github.com/identicons/aliceblockchain.png",
            location: "Berlin, Germany",
            public_repos: 42,
            html_url: "https://github.com/aliceblockchain",
            email: "",
            company: "",
            blog: "",
            twitter_username: "",
            created_at: "2018-07-22T14:30:00Z",
          },
        ];

        const partialContestants = createPartialContestants(mockGithubUsers);
        setContestants(partialContestants);
        setOverallProgress(calculateOverallProgress(partialContestants));
        setPollingActive(true);
        setLoading(false);
      } catch (error) {
        console.error(`[Progressive Event Detail] Error fetching basic data:`, error);
        setLoading(false);
      }
    };

    fetchBasicData();
  }, [id]);

  // Polling for analysis updates
  useEffect(() => {
    if (!pollingActive || analysisComplete) return;

    const interval = setInterval(simulateProgressUpdates, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [pollingActive, analysisComplete, simulateProgressUpdates]);

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

  if (loading) {
    return <AnalysisSkeleton userCount={2} />;
  }

  return (
    <div className="space-y-8">
      {/* Event Overview with Analysis Progress */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
        <CardHeader className="px-6 py-5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Analysis</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {contestants.length} contestants • {analysisComplete ? "Analysis complete" : "Analysis in progress"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {!analysisComplete && (
                <AnalysisProgress 
                  status="analyzing" 
                  progress={overallProgress}
                  message={`${contestants.filter(c => c.analysisStatus === "completed").length}/${contestants.length} completed`}
                />
              )}
              
              {analysisComplete && (
                <Badge color="success" variant="flat">
                  ✓ Complete
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Participants List with Progressive Loading */}
      <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border dark:border-border-dark">
          <div className="flex items-center justify-between w-full">
            <h4 className="font-medium text-gray-900 dark:text-white">Contestants</h4>
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
            const isExpanded = expandedContestants.has(contestant.id.toString());
            
            return (
              <div key={contestant.id} className="p-6">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${contestant.analysisStatus === "completed" ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700" : "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-500 border-gray-200 dark:border-gray-800"}`}>
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
                        onClick={() => toggleContestant(contestant.id.toString())}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                        {contestant.analysisStatus === "completed" && contestant.analytics ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contestant.analytics.map((analytics) => (
                              <div key={analytics.name} className="p-4 border border-border dark:border-border-dark rounded-lg">
                                <h6 className="font-medium text-gray-900 dark:text-white mb-2">
                                  {analytics.name}
                                </h6>
                                <div className="text-2xl font-bold text-primary mb-2">
                                  {analytics.score || 0}
                                </div>
                                {analytics.repos && (
                                  <div className="space-y-1">
                                    {analytics.repos.slice(0, 3).map((repo) => (
                                      <div key={repo.fullName} className="flex justify-between text-sm">
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
                          <AnalysisSkeleton showUserInfo={false} showEcosystemCards userCount={1} />
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
    </div>
  );
}

export default ProgressiveEventDetail;

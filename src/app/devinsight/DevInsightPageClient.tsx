'use client';

import { Button, Card, CardBody } from "@nextui-org/react";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { analyzeGitHubUser } from "~/profile-analysis/repository";
import type { AnalysisResult, BasicAnalysisResult, AnalysisStatus, GitHubUser } from "~/profile-analysis/typing";
import { hasAIData, hasEcosystemData } from "~/profile-analysis/helper";
// Progress card removed per design; keep skeleton-only loading experience
import { ProfileHeader, ProfileHeaderSkeleton } from "~/profile-analysis/views/profile-header";
import { KeyMetrics } from "~/profile-analysis/views/key-metrics";
import { AnalysisTabs } from "~/profile-analysis/views/analysis-tabs";
import { AIInsights, AIInsightsSkeleton } from "~/profile-analysis/views/ai-insights";
import MetricOverviewSkeleton from "$/loading/MetricOverviewSkeleton";
import ChartSkeleton from "$/loading/ChartSkeleton";
import FadeIn from "$/FadeIn";


interface DevInsightPageProps {
  requiresAuth: boolean;
  error?: string;
  user?: unknown;
  githubHandle?: string;
}

export default function DevInsightPageClient({
  requiresAuth,
  error,
  user: _user,
  githubHandle,
}: DevInsightPageProps) {
  const { ready, authenticated, login } = usePrivy();

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("pending");
  const [_progress, setProgress] = useState(0);
  const [_statusMessage, setStatusMessage] = useState("");
  const [basicInfo, setBasicInfo] = useState<BasicAnalysisResult | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  // Auto-trigger Privy login for unauthenticated users
  useEffect(() => {
    if (requiresAuth && ready && !authenticated) {
      login();
    }
  }, [requiresAuth, ready, authenticated, login]);

  // Auto-start analysis on component mount for authenticated users
  useEffect(() => {
    if (githubHandle && !isAnalyzing && analysisStatus === "pending") {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubHandle]);

  useEffect(() => {
    if (basicInfo?.id) {
      setAnalysisId(basicInfo.id);
    }
  }, [basicInfo]);

  useEffect(() => {
    if (results?.analysisId) {
      setAnalysisId(results.analysisId);
    }
  }, [results]);

  // Force re-render when results change to ensure AI insights appear
  useEffect(() => {
    if (results?.data?.users?.[0]?.ai) {
      // Force a small state update to trigger re-render
      setProgress(prev => prev === 100 ? 100 : 100);
    }
  }, [results]);

  const handleAnalyze = async () => {
    if (!githubHandle) {
      setAnalysisError("No GitHub handle found");
      return;
    }

    setAnalysisError("");
    setIsAnalyzing(true);
    setAnalysisStatus("analyzing");
    setProgress(0);
    setBasicInfo(null);
    setResults(null);
    setAnalysisId(null);

    try {
      const response = await analyzeGitHubUser(
        githubHandle,
        (status, progressValue, data) => {
          setStatusMessage(status);
          if (progressValue) setProgress(progressValue);
          // Live update results when partial data (including AI) arrives via polling
          if (data?.data?.users && data.data.users.length > 0) {
            setResults({
              data: { users: data.data.users as GitHubUser[] },
              status: data.status || "analyzing",
              progress: progressValue,
              message: status,
            });
          }
        },
        (basicData) => {
          setBasicInfo(basicData);
        },
      );

      if (response.success) {
        setAnalysisStatus("completed");
        setResults(response.data);
        setProgress(100);
      } else {
        setAnalysisStatus("failed");
        setAnalysisError(response.message);
      }
    } catch (err) {
      setAnalysisStatus("failed");
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get the current user data for display
  const currentUser = results?.data.users[0] || basicInfo?.users[0];

  if (error) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
          <CardBody className="p-8 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full inline-flex mb-4">
              <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading DevInsight
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <Button
              color="primary"
              onPress={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // For unauthenticated users, show a simple message and let the modal handle login
  if (requiresAuth) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
        <div className="w-full max-w-content mx-auto px-6 pt-8">
          {/* Header and Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain size={20} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DevInsight</h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              AI-powered Web3 development insights and analysis
            </p>
          </div>

          {/* Simple message - modal will handle the login */}
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                <Brain size={32} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Sign in to access DevInsight
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your GitHub account to unlock AI-powered Web3 development insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        {/* Header and Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">@{githubHandle} DevInsight</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            AI-powered Web3 development insights and analysis
          </p>
        </div>

        <div className="space-y-4">

          {/* Progress section intentionally removed; show skeletons only while analyzing */}

          {/* Error State */}
          {analysisError && (
            <Card className="bg-danger/5 border border-danger/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-danger" />
                  <div>
                    <h3 className="font-semibold text-danger mb-1">Analysis Failed</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{analysisError}</p>
                    <Button
                      color="danger"
                      variant="light"
                      size="sm"
                      onClick={handleAnalyze}
                      isLoading={isAnalyzing}
                    >
                      Retry Analysis
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Profile Content */}
          {currentUser && (
            <div className="space-y-4">
              {/* While analyzing, show skeletons for all sections */}
              {isAnalyzing ? (
                <>
                  <ProfileHeaderSkeleton />
                  <AIInsightsSkeleton />
                  <MetricOverviewSkeleton />
                  <ChartSkeleton title="Ecosystem Overview" height="280px" />
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Analysis in progress... Usually takes 2–3 minutes
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Profile Header - Full Width */}
                  <FadeIn>
                    <ProfileHeader user={currentUser} githubUsername={githubHandle} analysisId={analysisId} />
                  </FadeIn>

                  {/* Key Metrics */}
                  {hasEcosystemData(currentUser) && (
                    <FadeIn>
                      <KeyMetrics user={currentUser} />
                    </FadeIn>
                  )}

                  {/* AI Analysis */}
                  {hasAIData(currentUser) ? (
                    <FadeIn>
                      <AIInsights user={currentUser} />
                    </FadeIn>
                  ) : (
                    isAnalyzing && <AIInsightsSkeleton />
                  )}

                  {/* Detailed Analysis */}
                  {hasEcosystemData(currentUser) && (
                    <FadeIn>
                      <AnalysisTabs user={currentUser} githubUsername={githubHandle} />
                    </FadeIn>
                  )}
                </>
              )}

              {/* Loading State */}
              {!hasEcosystemData(currentUser) && !analysisError && !isAnalyzing && (
                <div className="glass-card dark:glass-card-dark p-4 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Analysis in progress...
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Usually takes 2-3 minutes
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial Loading State */}
          {!currentUser && !analysisError && isAnalyzing && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

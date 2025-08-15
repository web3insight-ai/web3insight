import { Button, Card, CardBody } from "@nextui-org/react";
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { getTitle } from "@/utils/app";
import { getGitHubHandle } from "~/profile-analysis/helper";
import { authModalOpenAtom } from "#/atoms";
import DefaultLayout from "../layouts/default";

import { fetchCurrentUser } from "~/auth/repository";
import {
  analyzeGitHubUser,
  type AnalysisResult,
  type BasicAnalysisResult,
  type AnalysisStatus,
  hasAIData,
  hasEcosystemData,
  AnalysisProgress,
  ProfileHeader,
  KeyMetrics,
  AnalysisTabs,
  AIInsights,
} from "~/profile-analysis";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = getTitle();
  const githubHandle = data?.githubHandle || "User";

  return [
    { title: `${githubHandle} DevInsight | ${title}` },
    { name: "description", content: `AI-powered DevInsight analysis of ${githubHandle}'s Web3 development profile` },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get authenticated user data - required for DevInsight
  const userResult = await fetchCurrentUser(request);

  // If not authenticated, return null user to trigger login modal
  if (!userResult.success || !userResult.data) {
    return json({
      user: null,
      githubHandle: null,
      requiresAuth: true,
    });
  }

  const user = userResult.data;

  // Get GitHub handle from authenticated user
  const githubHandle = getGitHubHandle(user);

  if (!githubHandle) {
    throw new Response("GitHub account must be connected to use DevInsight", { status: 400 });
  }

  // Validate GitHub handle format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(githubHandle)) {
    throw new Response("Invalid GitHub handle format", { status: 400 });
  }

  return json({
    user,
    githubHandle,
    requiresAuth: false,
  });
};

export default function DevInsightPage() {
  const { user, githubHandle, requiresAuth } = useLoaderData<typeof loader>();
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("pending");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [basicInfo, setBasicInfo] = useState<BasicAnalysisResult | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  // Auto-trigger login modal for unauthenticated users
  useEffect(() => {
    if (requiresAuth) {
      setAuthModalOpen(true);
    }
  }, [requiresAuth, setAuthModalOpen]);

  // Auto-start analysis on component mount for authenticated users
  useEffect(() => {
    if (githubHandle && !isAnalyzing && analysisStatus === "pending") {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubHandle]);

  const handleAnalyze = async () => {
    if (!githubHandle) {
      setError("No GitHub handle found");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setAnalysisStatus("analyzing");
    setProgress(0);
    setBasicInfo(null);
    setResults(null);

    try {
      const response = await analyzeGitHubUser(
        githubHandle,
        (status, progressValue) => {
          setStatusMessage(status);
          if (progressValue) setProgress(progressValue);
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
        setError(response.message);
      }
    } catch (err) {
      setAnalysisStatus("failed");
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get the current user data for display
  const currentUser = results?.data.users[0] || basicInfo?.users[0];

  // For unauthenticated users, show a simple message and let the modal handle login
  if (requiresAuth) {
    return (
      <DefaultLayout user={user}>
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
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout user={user}>
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
            {/* Analysis Progress - Auto-hide when completed */}
            {(isAnalyzing || (analysisStatus !== "pending" && analysisStatus !== "completed")) && (
              <AnalysisProgress
                status={analysisStatus}
                progress={progress}
                message={statusMessage}
                estimatedTime={isAnalyzing ? "2-3 minutes" : undefined}
              />
            )}

            {/* Error State */}
            {error && (
              <Card className="bg-danger/5 border border-danger/20">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-danger" />
                    <div>
                      <h3 className="font-semibold text-danger mb-1">Analysis Failed</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{error}</p>
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
                {/* Profile Header - Full Width */}
                <ProfileHeader user={currentUser} />

                {/* Key Metrics */}
                {hasEcosystemData(currentUser) && (
                  <KeyMetrics user={currentUser} />
                )}

                {/* AI Analysis */}
                {hasAIData(currentUser) && (
                  <AIInsights user={currentUser} />
                )}

                {/* Detailed Analysis */}
                {hasEcosystemData(currentUser) && (
                  <AnalysisTabs user={currentUser} />
                )}

                {/* Loading State */}
                {!hasEcosystemData(currentUser) && !error && (
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
            {!currentUser && !error && isAnalyzing && (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Starting DevInsight Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                    Fetching GitHub profile data for @{githubHandle}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

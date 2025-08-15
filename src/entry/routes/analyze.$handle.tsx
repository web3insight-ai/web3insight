import { Button, Card, CardBody } from "@nextui-org/react";
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { getTitle } from "@/utils/app";

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
    { title: `${githubHandle} Profile Analysis | ${title}` },
    { name: "description", content: `AI-powered analysis of ${githubHandle}'s Web3 development profile` },
  ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const githubHandle = params.handle;
  
  if (!githubHandle) {
    throw new Response("GitHub handle is required", { status: 400 });
  }

  // Validate GitHub handle format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(githubHandle)) {
    throw new Response("Invalid GitHub handle format", { status: 400 });
  }

  // Get user data for layout (optional - can be null for public access)
  const userResult = await fetchCurrentUser(request);
  const user = userResult.success ? userResult.data : null;

  return json({ 
    user,
    githubHandle,
  });
};

export default function ProfileAnalyzePublicPage() {
  const { user, githubHandle } = useLoaderData<typeof loader>();
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("pending");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [basicInfo, setBasicInfo] = useState<BasicAnalysisResult | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  // Auto-start analysis on component mount
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

  return (
    <DefaultLayout user={user}>
      <div className="min-h-screen bg-background dark:bg-background-dark">
        {/* Compact Hero Section with Navigation */}
        <div className="bg-white dark:bg-surface-dark border-b border-border dark:border-border-dark">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <Link to="/profile">
                <Button 
                  variant="light" 
                  startContent={<ArrowLeft size={16} />}
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  Back to Profile
                </Button>
              </Link>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  @{githubHandle} Analysis
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered Web3 development insights
                </p>
              </div>
              
              <div className="w-24" /> {/* Spacer for center alignment */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-4 space-y-4">
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

          {/* Profile Content - Compact Layout */}
          {currentUser && (
            <div className="space-y-3 max-w-4xl mx-auto">
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
                        分析处理中...
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      通常需要 2-3 分钟
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
                    Starting Analysis
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
    </DefaultLayout>
  );
}

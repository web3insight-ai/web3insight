import { 
  Card, 
  CardBody, 
  Avatar, 
  Button, 
  Chip,
  Divider,
} from "@nextui-org/react";
import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { 
  ArrowLeft,
  Brain, 
  Github,
  Building,
  MapPin,
  Calendar,
  Globe,
  Target,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

import { getTitle } from "@/utils/app";

import DefaultLayout from "../layouts/default";
import Section from "../components/section";

import { fetchCurrentUser } from "~/auth/repository";
import { 
  analyzeGitHubUser,
  type AnalysisResult,
  type BasicAnalysisResult,
  type AnalysisStatus,
  type GitHubUser,
  getInvolvementLevelColor,
  formatAnalysisDate,
  hasAIData,
  hasEcosystemData,
  AnalysisProgress,
  AIProfileDisplay,
  EcosystemInsights,
  RepositoryBreakdown,
  ActivityAnalytics,
  TechnicalBreakdown,
  RepositoryContributions,
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

  // Get user data for layout (optional - can be null for public access)
  const userResult = await fetchCurrentUser(request);
  const user = userResult.success ? userResult.data : null;

  return json({ 
    user,
    githubHandle,
  });
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

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

  const renderUserCard = (user: GitHubUser) => (
    <Card className="bg-white dark:bg-surface-dark shadow-subtle border border-border dark:border-border-dark">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <Avatar
              src={user.avatar_url}
              name={user.name || user.login}
              size="lg" 
              className="w-20 h-20 text-large"
              isBordered
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.name || user.login}
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  to={user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Chip
                    color="primary"
                    variant="flat" 
                    size="sm"
                    startContent={<Github size={12} />}
                  >
                    @{user.login}
                  </Chip>
                </Link>
              </div>
            </div>
            
            {user.bio && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {user.company && (
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user.company}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{user.location}</span>
                </div>
              )}
              {user.blog && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-gray-400" />
                  <a
                    href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    {user.blog.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Joined {formatDate(user.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Divider className="my-4" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatNumber(user.public_repos)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Repositories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{formatNumber(user.followers)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{formatNumber(user.following)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
          </div>
          {user.public_gists && (
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{formatNumber(user.public_gists)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gists</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );

  const renderAIAnalysis = (user: GitHubUser) => {
    if (!user.ai || !hasAIData(user)) return null;

    const aiProfile = user.ai;
    
    return (
      <div className="space-y-6">
        {/* AI Analysis Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Brain size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Analysis Results
              </h3>
            </div>
            {aiProfile.analysis_date && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analysis completed on {formatAnalysisDate(aiProfile.analysis_date)}
              </p>
            )}
          </CardBody>
        </Card>

        {/* Comprehensive AI Profile Display with all visualizations */}
        <AIProfileDisplay aiProfile={aiProfile} />

        {/* Additional Web3 Involvement and Recommendation Cards for legacy compatibility */}
        {aiProfile.web3_involvement && (
          <Card className="bg-white dark:bg-surface-dark shadow-subtle">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target size={20} className="text-primary" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Web3 Involvement
                </h4>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Level: </span>
                  <Chip 
                    color={getInvolvementLevelColor(aiProfile.web3_involvement.level)}
                    variant="flat"
                    size="sm"
                  >
                    {aiProfile.web3_involvement.level}
                  </Chip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
                  <span className="font-semibold text-xl">{aiProfile.web3_involvement.score}/100</span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recommendation */}
        {aiProfile.recommendation && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target size={20} className="text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Recommendations
                </h4>
              </div>
              
              <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                {aiProfile.recommendation}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  return (
    <DefaultLayout user={user}>
      <div className="min-h-dvh flex flex-col">
        <div className="w-full max-w-content mx-auto px-6 py-8">
          <Section
            title={`Profile Analysis - @${githubHandle}`}
            summary="AI-powered insights into Web3 development journey"
          >
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Back Button */}
              <div className="flex items-center gap-4">
                <Link to="/profile">
                  <Button 
                    variant="light" 
                    startContent={<ArrowLeft size={16} />}
                    size="sm"
                  >
                    Back to Profile
                  </Button>
                </Link>
              </div>

              {/* Analysis Progress */}
              {(isAnalyzing || analysisStatus !== "pending") && (
                <AnalysisProgress
                  status={analysisStatus}
                  progress={progress}
                  message={statusMessage}
                  estimatedTime={isAnalyzing ? "3-5 minutes" : undefined}
                />
              )}

              {/* Error State */}
              {error && (
                <Card className="bg-danger/10 border border-danger/20">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className="text-danger" />
                      <div>
                        <h3 className="font-semibold text-danger mb-1">Analysis Failed</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                        <div className="mt-3">
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
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Basic Profile Info from Initial POST */}
              {basicInfo && basicInfo.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    GitHub Profile
                  </h3>
                  {renderUserCard(basicInfo.users[0])}
                </div>
              )}

              {/* Progressive Visualization Levels */}
              {results && results.data.users.length > 0 && (
                <div className="space-y-8">
                  {results.data.users.map(user => (
                    <div key={user.login} className="space-y-8">
                      {/* Level 2: Ecosystem Visualizations (when ecosystem data available) */}
                      {hasEcosystemData(user) && (
                        <div className="space-y-8">
                          {/* Ecosystem Insights - Main overview */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🌐 Web3 Ecosystem Analysis
                            </h3>
                            <EcosystemInsights ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Repository Breakdown - Detailed repo analysis */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              📚 Repository Analysis
                            </h3>
                            <RepositoryBreakdown ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Activity Analytics - Time-based insights */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              📊 Development Timeline
                            </h3>
                            <ActivityAnalytics ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Technical Breakdown - Inferred from ecosystem data */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🔧 Technical Profile
                            </h3>
                            <TechnicalBreakdown ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Repository Contributions - Alternative view */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🏆 Top Contributions
                            </h3>
                            <RepositoryContributions ecosystemScores={user.ecosystem_scores!} />
                          </div>
                        </div>
                      )}

                      {/* Level 3: AI Analysis Results (when AI data available) */}
                      {hasAIData(user) && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🤖 AI-Powered Insights
                          </h3>
                          {renderAIAnalysis(user)}
                        </div>
                      )}

                      {/* AI Analysis in Progress Notice (when ecosystem data exists but AI is not ready) */}
                      {hasEcosystemData(user) && !hasAIData(user) && (
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <CardBody className="p-6">
                            <div className="flex items-center gap-3 mb-2">
                              <Brain size={20} className="text-blue-600" />
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                AI Analysis in Progress
                              </h4>
                            </div>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              AI-powered insights are being generated. The analysis above shows your current Web3 ecosystem data.
                            </p>
                          </CardBody>
                        </Card>
                      )}

                      {/* No Data State - Only when no ecosystem data at all */}
                      {!hasEcosystemData(user) && !hasAIData(user) && (
                        <Card className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <CardBody className="p-8 text-center">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Analysis In Progress
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              We&apos;re processing your Web3 activity data. This may take a few moments...
                            </p>
                            <Button 
                              color="primary" 
                              variant="light" 
                              size="sm"
                              onClick={() => window.location.reload()}
                            >
                              Refresh Results
                            </Button>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Also show ecosystem components for basic info if available */}
              {basicInfo && basicInfo.users.length > 0 && !results && (
                <div className="space-y-8">
                  {basicInfo.users.map(user => (
                    <div key={user.login} className="space-y-8">
                      {/* Check if basic info has ecosystem data and show components */}
                      {hasEcosystemData(user) && (
                        <div className="space-y-8">
                          {/* Ecosystem Insights - Main overview */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🌐 Web3 Ecosystem Analysis
                            </h3>
                            <EcosystemInsights ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Repository Breakdown - Detailed repo analysis */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              📚 Repository Analysis
                            </h3>
                            <RepositoryBreakdown ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Activity Analytics - Time-based insights */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              📊 Development Timeline
                            </h3>
                            <ActivityAnalytics ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Technical Breakdown - Inferred from ecosystem data */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🔧 Technical Profile
                            </h3>
                            <TechnicalBreakdown ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* Repository Contributions - Alternative view */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              🏆 Top Contributions
                            </h3>
                            <RepositoryContributions ecosystemScores={user.ecosystem_scores!} />
                          </div>

                          {/* AI Analysis in Progress Notice */}
                          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <CardBody className="p-6">
                              <div className="flex items-center gap-3 mb-2">
                                <Brain size={20} className="text-blue-600" />
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                                  AI Analysis in Progress
                                </h4>
                              </div>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                AI-powered insights are being generated. The analysis above shows your current Web3 ecosystem data.
                              </p>
                            </CardBody>
                          </Card>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>
    </DefaultLayout>
  );
}

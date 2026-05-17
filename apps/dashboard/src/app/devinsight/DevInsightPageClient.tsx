"use client";

import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { analyzeGitHubUser } from "~/profile-analysis/repository";
import type {
  AnalysisResult,
  BasicAnalysisResult,
  AnalysisStatus,
  GitHubUser,
} from "~/profile-analysis/typing";
import { hasAIData, hasEcosystemData } from "~/profile-analysis/helper";
import {
  ProfileHeader,
  ProfileHeaderSkeleton,
} from "~/profile-analysis/views/profile-header";
import { KeyMetrics } from "~/profile-analysis/views/key-metrics";
import { AnalysisTabs } from "~/profile-analysis/views/analysis-tabs";
import {
  AIInsights,
  AIInsightsSkeleton,
} from "~/profile-analysis/views/ai-insights";
import MetricOverviewSkeleton from "$/loading/MetricOverviewSkeleton";
import ChartSkeleton from "$/loading/ChartSkeleton";
import FadeIn from "$/FadeIn";
import { SmallCapsLabel } from "$/primitives";

interface DevInsightPageProps {
  requiresAuth: boolean;
  error?: string;
  user?: unknown;
  githubHandle?: string;
}

function PageHero({ handle }: { handle?: string | null }) {
  return (
    <div className="flex flex-col gap-4 pb-10 border-b border-rule">
      <SmallCapsLabel tone="accent">DevInsight · AI brief</SmallCapsLabel>
      <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] leading-[1.05] font-semibold tracking-[-0.02em] text-fg max-w-[20ch]">
        {handle ? (
          <>
            <span className="font-mono text-fg-muted">@{handle}</span>
            <span className="text-fg-subtle font-sans font-normal"> / </span>
            <br />
            an unblinking developer brief.
          </>
        ) : (
          <>A candid developer brief, generated from commits.</>
        )}
      </h1>
      <p className="text-[1rem] leading-[1.55] text-fg-muted max-w-[var(--measure)]">
        Commit velocity, ecosystem reach, and language footprint — distilled
        into a readable profile you can paste into a grant memo. Methodology
        stays visible; sources are linked. Read it top-to-bottom.
      </p>
    </div>
  );
}

export default function DevInsightPageClient({
  requiresAuth,
  error,
  user: _user,
  githubHandle: serverGithubHandle,
}: DevInsightPageProps) {
  const {
    ready,
    authenticated,
    login,
    user: privyUser,
    linkGithub,
  } = usePrivy();

  const githubAccount = privyUser?.linkedAccounts?.find(
    (acc) => acc.type === "github_oauth",
  );
  const privyGithubHandle = githubAccount?.username || null;
  const githubHandle = serverGithubHandle || privyGithubHandle;

  const [isLinkingGithub, setIsLinkingGithub] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  useEffect(() => {
    if (error && ready && authenticated && !githubHandle) {
      setShowGitHubModal(true);
    } else {
      setShowGitHubModal(false);
    }
  }, [error, ready, authenticated, githubHandle]);

  const handleLinkGithub = async () => {
    setIsLinkingGithub(true);
    try {
      await linkGithub();
    } catch (_error) {
      // Privy UI handles errors
    } finally {
      setIsLinkingGithub(false);
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] =
    useState<AnalysisStatus>("pending");
  const [_progress, setProgress] = useState(0);
  const [_statusMessage, setStatusMessage] = useState("");
  const [basicInfo, setBasicInfo] = useState<BasicAnalysisResult | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  useEffect(() => {
    if (requiresAuth && ready && !authenticated) login();
  }, [requiresAuth, ready, authenticated, login]);

  useEffect(() => {
    if (ready && githubHandle && !isAnalyzing) {
      if (analysisStatus === "pending" || (!results && !basicInfo)) {
        handleAnalyze();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, githubHandle]);

  useEffect(() => {
    if (basicInfo?.id) setAnalysisId(basicInfo.id);
  }, [basicInfo]);

  useEffect(() => {
    if (results?.analysisId) setAnalysisId(results.analysisId);
  }, [results]);

  useEffect(() => {
    if (results?.data?.users?.[0]?.ai) {
      setProgress((prev) => (prev === 100 ? 100 : 100));
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

  const currentUser = results?.data.users[0] || basicInfo?.users[0];

  if (requiresAuth) {
    return (
      <div className="w-full max-w-content mx-auto px-6 pt-12 pb-24">
        <PageHero />
        <div className="mt-20 flex flex-col items-start gap-4 max-w-[var(--measure)]">
          <SmallCapsLabel tone="subtle">Sign in required</SmallCapsLabel>
          <h2 className="font-display text-[1.5rem] leading-[1.2] font-semibold text-fg">
            Link your GitHub to unlock the brief.
          </h2>
          <p className="text-[0.9375rem] leading-[1.55] text-fg-muted">
            DevInsight reads public commit and ecosystem data — no private repos
            — and returns an AI-written summary you can share.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-content mx-auto px-6 pt-12 pb-24">
      <PageHero handle={githubHandle} />

      {analysisError && (
        <div className="mt-10 border-t border-rule pt-6 flex flex-col gap-3 max-w-[var(--measure)]">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-danger" />
            <SmallCapsLabel tone="subtle">Analysis failed</SmallCapsLabel>
          </div>
          <p className="text-[0.9375rem] leading-[1.5] text-fg">
            {analysisError}
          </p>
          <Button
            color="danger"
            variant="light"
            size="sm"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            className="self-start px-0 h-7"
          >
            Retry analysis →
          </Button>
        </div>
      )}

      {currentUser && (
        <div className="flex flex-col gap-16 mt-10">
          {isAnalyzing ? (
            <>
              <ProfileHeaderSkeleton />
              <AIInsightsSkeleton />
              <MetricOverviewSkeleton />
              <ChartSkeleton title="Ecosystem brief" height="280px" />
              <div className="border-t border-rule pt-5 flex items-center gap-2 text-[0.8125rem] text-fg-muted">
                <Loader2 size={12} className="animate-spin" />
                Analysis in progress — usually 2–3 minutes. You can leave this
                tab open.
              </div>
            </>
          ) : (
            <>
              <FadeIn>
                <ProfileHeader
                  user={currentUser}
                  githubUsername={githubHandle || undefined}
                  analysisId={analysisId}
                />
              </FadeIn>

              {hasEcosystemData(currentUser) && (
                <FadeIn>
                  <KeyMetrics user={currentUser} />
                </FadeIn>
              )}

              {hasAIData(currentUser) ? (
                <FadeIn>
                  <AIInsights user={currentUser} />
                </FadeIn>
              ) : (
                isAnalyzing && <AIInsightsSkeleton />
              )}

              {hasEcosystemData(currentUser) && (
                <FadeIn>
                  <AnalysisTabs
                    user={currentUser}
                    githubUsername={githubHandle || undefined}
                  />
                </FadeIn>
              )}
            </>
          )}

          {!hasEcosystemData(currentUser) && !analysisError && !isAnalyzing && (
            <div className="border-t border-rule pt-5 flex items-center gap-2 text-[0.8125rem] text-fg-muted">
              <Loader2 size={12} className="animate-spin" />
              Analysis in progress — usually 2–3 minutes.
            </div>
          )}
        </div>
      )}

      {!currentUser && !analysisError && isAnalyzing && (
        <div className="mt-20 flex items-center justify-center min-h-[40vh] text-fg-muted">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-accent" />
            <SmallCapsLabel tone="subtle">
              Reading commits and ecosystems…
            </SmallCapsLabel>
          </div>
        </div>
      )}

      <Modal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <SmallCapsLabel tone="subtle">Action required</SmallCapsLabel>
            <span className="font-display text-[1.25rem] font-semibold text-fg">
              Link your GitHub to continue
            </span>
          </ModalHeader>
          <ModalBody>
            <p className="text-[0.9375rem] leading-[1.55] text-fg-muted">
              Connect GitHub to unlock the brief. We only read public data:
              commits, repos, languages, and ecosystem associations.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowGitHubModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleLinkGithub}
              isLoading={isLinkingGithub}
            >
              Connect GitHub
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

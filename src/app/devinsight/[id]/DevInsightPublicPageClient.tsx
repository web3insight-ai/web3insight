'use client';

import { Card, CardBody } from "@nextui-org/react";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import type { GitHubUser } from "~/profile-analysis/typing";
import { hasAIData, hasEcosystemData } from "~/profile-analysis/helper";
import { ProfileHeader } from "~/profile-analysis/views/profile-header";
import { KeyMetrics } from "~/profile-analysis/views/key-metrics";
import { AIInsights } from "~/profile-analysis/views/ai-insights";
import { AnalysisTabs } from "~/profile-analysis/views/analysis-tabs";
import FadeIn from "$/FadeIn";

interface DevInsightPublicPageClientProps {
  analysisId: number | null;
  githubHandle?: string;
  users: GitHubUser[];
  updatedAt?: string;
  isPublic: boolean;
  error?: string;
}

export default function DevInsightPublicPageClient({
  analysisId,
  githubHandle,
  users,
  updatedAt: _updatedAt,
  isPublic,
  error,
}: DevInsightPublicPageClientProps) {

  const currentUser = users[0] ?? null;
  const sanitizedHandle = githubHandle || currentUser?.login || undefined;
  const displayHandle = sanitizedHandle || (analysisId ? `analysis-${analysisId}` : "DevInsight");

  if (error || !isPublic) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark flex items-center justify-center px-6">
        <Card className="w-full max-w-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
          <CardBody className="p-8 text-center">
            <div className="p-3 bg-warning/10 rounded-full inline-flex mb-4">
              <AlertCircle size={24} className="text-warning" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              DevInsight Unavailable
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || "This DevInsight analysis is no longer public."}
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-400">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-sm">DevInsight analysis is generating. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background dark:bg-background-dark pb-24">
      <div className="w-full max-w-content mx-auto px-6 pt-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain size={20} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">@{displayHandle} DevInsight</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            AI-powered Web3 development insights and analysis.
          </p>
        </div>

        <div className="space-y-4">

          <FadeIn>
            <ProfileHeader user={currentUser} githubUsername={sanitizedHandle} />
          </FadeIn>

          {hasEcosystemData(currentUser) && (
            <FadeIn>
              <KeyMetrics user={currentUser} />
            </FadeIn>
          )}

          {hasAIData(currentUser) && (
            <FadeIn>
              <AIInsights user={currentUser} />
            </FadeIn>
          )}

          {hasEcosystemData(currentUser) && (
            <FadeIn>
              <AnalysisTabs user={currentUser} githubUsername={sanitizedHandle} />
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}

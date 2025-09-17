import type { Metadata } from "next";

import DefaultLayoutWrapper from "../../DefaultLayoutWrapper";
import DevInsightPublicPageClient from "./DevInsightPublicPageClient";
import { buildAnalysisResultFromRaw } from "~/profile-analysis/repository";
import type { RawAnalysisResult } from "~/profile-analysis/typing";
import { getTitle } from "@/utils/app";
import { env } from "@/env";

async function fetchSharedAnalysis(id: string): Promise<RawAnalysisResult | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    const response = await fetch(`${env.DATA_API_URL}/v1/custom/analysis/users/${id}`, {
      method: "GET",
      headers,
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as RawAnalysisResult;
    return data;
  } catch (error) {
    console.error("[DevInsight] Failed to fetch public analysis:", error);
    return null;
  }
}

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const baseTitle = getTitle();
  const id = params.id;

  const analysis = await fetchSharedAnalysis(id);

  if (analysis?.github?.users?.[0]) {
    const handle = analysis.github.users[0].login;
    return {
      title: `${handle} DevInsight | ${baseTitle}`,
      description: `Public DevInsight analysis for GitHub user ${handle}.`,
    };
  }

  return {
    title: `DevInsight ${id} | ${baseTitle}`,
    description: "Shared DevInsight analysis on Web3 Insight.",
  };
}

export default async function DevInsightSharedPage({ params }: PageProps) {
  const id = params.id;
  const rawResult = await fetchSharedAnalysis(id);

  if (!rawResult) {
    return (
      <DefaultLayoutWrapper user={null}>
        <DevInsightPublicPageClient
          analysisId={Number.isFinite(Number(id)) ? Number(id) : null}
          githubHandle={undefined}
          users={[]}
          updatedAt={undefined}
          isPublic={false}
          error="DevInsight analysis not found or not shared."
        />
      </DefaultLayoutWrapper>
    );
  }

  const analysis = buildAnalysisResultFromRaw(rawResult, "completed", Number(id));
  const githubUser = analysis.data.users[0] || rawResult.github?.users?.[0];
  const githubHandle = githubUser?.login;
  const isPublic = Boolean(rawResult.public);

  return (
    <DefaultLayoutWrapper user={null}>
      <DevInsightPublicPageClient
        analysisId={analysis.analysisId ?? (Number.isFinite(Number(id)) ? Number(id) : null)}
        githubHandle={githubHandle}
        users={isPublic ? analysis.data.users : []}
        updatedAt={rawResult.updated_at}
        isPublic={isPublic}
        error={isPublic ? undefined : "This DevInsight analysis is private."}
      />
    </DefaultLayoutWrapper>
  );
}

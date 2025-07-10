import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getTitle } from "@/utils/app";
import { ChartSkeleton } from "@/components/loading";

import { fetchRepoRankList } from "~/api/repository";
import { fetchRepo } from "~/ossinsight/repository";
import { fetchRepoAnalysis } from "~/ecosystem/repository/legacy";
import RepositoryDetailView from "~/repository/views/repository-detail";

import ClientOnly from "../components/ClientOnly";

export const loader = async (ctx: LoaderFunctionArgs) => {
  const repoId = ctx.params.id;

  if (!repoId) {
    throw new Response("Repository ID is required", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  // First, fetch the repository rank list to find the repository by ID
  const rankListRes = await fetchRepoRankList();
  
  if (!rankListRes.success || !rankListRes.data) {
    throw new Response("Failed to fetch repository data", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  const repoRankData = rankListRes.data.list.find(repo => repo.repo_id === parseInt(repoId));
  
  if (!repoRankData) {
    throw new Response(`Repository with ID \`${repoId}\` doesn't exist.`, {
      status: 404,
      statusText: "Not Found",
    });
  }

  // Use the repository name to fetch detailed data
  const repoName = repoRankData.repo_name;

  try {
    const [repoDetailsRes, analysisRes] = await Promise.all([
      fetchRepo(repoName),
      fetchRepoAnalysis(repoName),
    ]);

    return json({
      repository: {
        id: repoRankData.repo_id,
        name: repoName,
        starCount: repoRankData.star_count,
        forksCount: repoRankData.forks_count,
        openIssuesCount: repoRankData.open_issues_count,
        contributorCount: repoRankData.contributor_count,
        details: repoDetailsRes.success ? repoDetailsRes.data : null,
      },
      analysis: analysisRes.success ? analysisRes.data : null,
    });
  } catch (error) {
    console.error(`[Route] Error fetching repository details:`, error);
    // Return basic data even if detailed fetches fail
    return json({
      repository: {
        id: repoRankData.repo_id,
        name: repoName,
        starCount: repoRankData.star_count,
        forksCount: repoRankData.forks_count,
        openIssuesCount: repoRankData.open_issues_count,
        contributorCount: repoRankData.contributor_count,
        details: null,
      },
      analysis: null,
    });
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const baseTitle = `Repository Details - ${getTitle()}`;
  const repoName = data?.repository?.name || "Unknown";
  const title = `${repoName} - ${baseTitle}`;

  return [
    { title },
    { property: "og:title", content: title },
    {
      name: "description",
      content: data
        ? `Repository analytics and metrics for ${repoName}. Track development activity, contributors, and community engagement.`
        : "Web3 repository analytics and metrics",
    },
  ];
};

export default function RepositoryDetailPage() {
  const { repository, analysis } = useLoaderData<typeof loader>();
  
  // Show loading skeleton while critical data is missing
  if (!repository || !repository.name) {
    return (
      <div className="min-h-dvh bg-background dark:bg-background-dark py-8">
        <div className="w-full max-w-content mx-auto px-6">
          <div className="mb-8">
            <ChartSkeleton title="Loading repository..." height="120px" />
          </div>
          <div className="space-y-6">
            <ChartSkeleton title="OpenRank Trend" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton title="Active Participants" height="280px" />
              <ChartSkeleton title="New Contributors" height="280px" />
            </div>
            <ChartSkeleton title="Repository Attention" height="280px" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <RepositoryDetailView repository={repository} analysis={analysis} />
    </ClientOnly>
  );
}
